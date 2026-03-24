"""
Query routing API for participant study interactions.

Routes queries to the correct backend connector based on the participant's
current step and condition assignment.
"""

import asyncio
import json
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse, ServerSentEvent

from db.engine import get_session
from db.models import Study, Participant, BackendConfig, ActivityLog
from schemas import (
    Message, ChatResponseEvent, StreamEvent,
    ConnectorInfoStream, ErrorStream, StreamEndStream
)
from connectors.registry import ConnectorRegistry

router = APIRouter(
    prefix="/api/v1/studies/{study_id}/participants/{participant_id}",
    tags=["query"]
)


class QueryRequest(BaseModel):
    query: str
    history: List[Message] = Field(default_factory=list)


def flatten_procedure(steps: List[Dict[str, Any]], condition_order: List[str]) -> List[Dict[str, Any]]:
    """
    Flatten a procedure's steps by expanding blocks into their children
    in the order specified by the participant's condition_order.

    Non-block steps pass through unchanged. Block steps are replaced by
    their children, reordered to match condition_order.

    Args:
        steps: The procedure's steps array from procedure_json
        condition_order: The participant's assigned condition order

    Returns:
        A flat list of steps with blocks expanded
    """
    result = []
    for step in steps:
        if step.get("type") == "block":
            children = step.get("children", [])
            if condition_order:
                # Sort children by their position in condition_order
                order_map = {name: i for i, name in enumerate(condition_order)}
                sorted_children = sorted(
                    children,
                    key=lambda c: order_map.get(c.get("title", ""), len(condition_order))
                )
                result.extend(sorted_children)
            else:
                result.extend(children)
        else:
            result.append(step)
    return result


def create_error_event(detail: str):
    """Create an SSE error event."""
    obj = ChatResponseEvent(
        data=ErrorStream(detail=detail),
        event=StreamEvent.ERROR,
    )
    return ServerSentEvent(
        data=json.dumps(jsonable_encoder(obj)),
        event="error",
    )


@router.post("/query")
async def query_connector(
    study_id: int,
    participant_id: int,
    query_request: QueryRequest,
    request: Request,
    db: Session = Depends(get_session)
):
    """
    Route a participant's query to their assigned backend connector.

    Returns an SSE stream using the ChatResponseEvent format.
    The first event is a connector-info event with the connector type.
    """
    # 1. Fetch participant
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.study_id == study_id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    if participant.status != "active":
        raise HTTPException(status_code=400, detail="Participant is not active")

    # 2. Fetch study and parse procedure
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study or not study.procedure_json:
        raise HTTPException(status_code=400, detail="Study has no procedure configured")

    procedure = json.loads(study.procedure_json)
    steps = procedure.get("steps", [])

    # 3. Flatten procedure using participant's condition order
    condition_order = json.loads(participant.condition_order) if participant.condition_order else []
    flat_steps = flatten_procedure(steps, condition_order)

    # 4. Get current step
    if participant.current_step >= len(flat_steps):
        raise HTTPException(status_code=400, detail="Participant has completed all steps")

    current_step = flat_steps[participant.current_step]

    # 5. Verify step is a queryable condition
    if current_step.get("type") != "condition":
        raise HTTPException(
            status_code=400,
            detail="Current step is not a queryable condition"
        )

    # 6. Get backend config
    backend_config_id = current_step.get("backend_config_id")
    if not backend_config_id:
        raise HTTPException(
            status_code=400,
            detail="Current condition has no backend configured"
        )

    backend_config = db.query(BackendConfig).filter(
        BackendConfig.id == backend_config_id
    ).first()
    if not backend_config:
        raise HTTPException(
            status_code=404,
            detail="Backend configuration not found"
        )

    # 7. Create connector
    try:
        connector = ConnectorRegistry.create_from_db_config(backend_config)
    except ValueError as e:
        async def error_stream():
            yield create_error_event(f"Connector type not available: {str(e)}")
        return EventSourceResponse(error_stream(), media_type="text/event-stream")

    # 8. Stream response
    async def generator():
        try:
            # First event: connector info
            info_event = ChatResponseEvent(
                event=StreamEvent.CONNECTOR_INFO,
                data=ConnectorInfoStream(connector_type=backend_config.connector_type)
            )
            yield json.dumps(jsonable_encoder(info_event))

            # Stream from connector
            async for event in connector.process_query(
                query_request.query,
                query_request.history if query_request.history else None
            ):
                if await request.is_disconnected():
                    break
                yield json.dumps(jsonable_encoder(event))
                await asyncio.sleep(0)

        except Exception as e:
            yield create_error_event(str(e))
            await asyncio.sleep(0)

    # 9. Log the interaction (fire and forget)
    try:
        from datetime import datetime
        log = ActivityLog(
            user_id=participant.external_id,
            task_id=str(study_id),
            action="QUERY",
            query=query_request.query,
            content=backend_config.connector_type,
            timestamp=int(datetime.utcnow().timestamp())
        )
        db.add(log)
        db.commit()
    except Exception:
        pass  # Don't fail the query if logging fails

    return EventSourceResponse(generator(), media_type="text/event-stream")
