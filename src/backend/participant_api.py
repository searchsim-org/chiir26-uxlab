"""
Participant API endpoints for managing participants in studies.
"""

import json
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.engine import get_session
from db.models import Study, Participant, StudyCondition
from counterbalancing import assign_condition_order, generate_completion_code, get_group_assignment
from query_api import flatten_procedure

router = APIRouter(prefix="/api/v1/studies/{study_id}/participants", tags=["participants"])


# ============================================================================
# Pydantic Schemas
# ============================================================================

class ParticipantRegister(BaseModel):
    external_id: str = Field(..., min_length=1)
    external_platform: Optional[str] = None  # prolific, mturk, etc.


class ParticipantResponse(BaseModel):
    id: int
    external_id: str
    external_platform: Optional[str]
    study_id: int
    condition_order: Optional[List[str]] = None
    current_step: int
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    completion_code: Optional[str] = None
    paused_until: Optional[datetime] = None

    class Config:
        from_attributes = True


class ParticipantStateResponse(BaseModel):
    participant_id: int
    study_id: int
    study_name: str
    current_step: int
    total_steps: int
    current_condition: Optional[str] = None
    condition_order: Optional[List[str]] = None
    status: str
    procedure: Optional[dict] = None


class ParticipantListResponse(BaseModel):
    participants: List[ParticipantResponse]
    total: int
    active: int
    completed: int
    dropped: int


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("", response_model=ParticipantResponse)
async def register_participant(
    study_id: int,
    participant: ParticipantRegister,
    db: Session = Depends(get_session)
):
    """Register a new participant for a study."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    if study.status != "active":
        raise HTTPException(status_code=400, detail="Study is not currently accepting participants")
    
    # Check if participant already exists
    existing = db.query(Participant).filter(
        Participant.study_id == study_id,
        Participant.external_id == participant.external_id
    ).first()
    
    if existing:
        # Return existing participant instead of creating duplicate
        condition_order = json.loads(existing.condition_order) if existing.condition_order else None
        return ParticipantResponse(
            id=existing.id,
            external_id=existing.external_id,
            external_platform=existing.external_platform,
            study_id=existing.study_id,
            condition_order=condition_order,
            current_step=existing.current_step,
            status=existing.status,
            started_at=existing.started_at,
            completed_at=existing.completed_at,
            completion_code=existing.completion_code,
            paused_until=existing.paused_until
        )
    
    # Get conditions for counterbalancing
    conditions = db.query(StudyCondition).filter(
        StudyCondition.study_id == study_id
    ).order_by(StudyCondition.order_index).all()
    
    condition_names = [c.name for c in conditions]
    
    # Determine participant number for counterbalancing
    existing_count = db.query(Participant).filter(
        Participant.study_id == study_id
    ).count()
    
    # Assign condition order based on study design
    if study.design_type == "within-subject" and len(condition_names) > 0:
        assigned_order = assign_condition_order(
            participant_number=existing_count,
            conditions=condition_names,
            method="balanced_latin_square"
        )
    elif study.design_type == "between-subject" and len(condition_names) > 0:
        group_index = get_group_assignment(existing_count, len(condition_names))
        assigned_order = [condition_names[group_index]]
    else:
        assigned_order = condition_names
    
    new_participant = Participant(
        external_id=participant.external_id,
        external_platform=participant.external_platform,
        study_id=study_id,
        condition_order=json.dumps(assigned_order) if assigned_order else None,
        current_step=0,
        status="active"
    )
    db.add(new_participant)
    db.commit()
    db.refresh(new_participant)
    
    return ParticipantResponse(
        id=new_participant.id,
        external_id=new_participant.external_id,
        external_platform=new_participant.external_platform,
        study_id=new_participant.study_id,
        condition_order=assigned_order,
        current_step=new_participant.current_step,
        status=new_participant.status,
        started_at=new_participant.started_at,
        completed_at=new_participant.completed_at,
        completion_code=new_participant.completion_code
    )


@router.get("", response_model=ParticipantListResponse)
async def list_participants(
    study_id: int,
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_session)
):
    """List all participants for a study."""
    query = db.query(Participant).filter(Participant.study_id == study_id)
    
    if status:
        query = query.filter(Participant.status == status)
    
    participants = query.order_by(Participant.started_at.desc()).all()
    
    # Count by status
    all_participants = db.query(Participant).filter(Participant.study_id == study_id).all()
    active_count = sum(1 for p in all_participants if p.status == "active")
    completed_count = sum(1 for p in all_participants if p.status == "completed")
    dropped_count = sum(1 for p in all_participants if p.status == "dropped")
    
    participant_responses = []
    for p in participants:
        condition_order = json.loads(p.condition_order) if p.condition_order else None
        participant_responses.append(ParticipantResponse(
            id=p.id,
            external_id=p.external_id,
            external_platform=p.external_platform,
            study_id=p.study_id,
            condition_order=condition_order,
            current_step=p.current_step,
            status=p.status,
            started_at=p.started_at,
            completed_at=p.completed_at,
            completion_code=p.completion_code,
            paused_until=p.paused_until
        ))
    
    return ParticipantListResponse(
        participants=participant_responses,
        total=len(all_participants),
        active=active_count,
        completed=completed_count,
        dropped=dropped_count
    )


@router.get("/{participant_id}", response_model=ParticipantResponse)
async def get_participant(
    study_id: int,
    participant_id: int,
    db: Session = Depends(get_session)
):
    """Get a specific participant."""
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.study_id == study_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    condition_order = json.loads(participant.condition_order) if participant.condition_order else None
    
    return ParticipantResponse(
        id=participant.id,
        external_id=participant.external_id,
        external_platform=participant.external_platform,
        study_id=participant.study_id,
        condition_order=condition_order,
        current_step=participant.current_step,
        status=participant.status,
        started_at=participant.started_at,
        completed_at=participant.completed_at,
        completion_code=participant.completion_code,
        paused_until=participant.paused_until
    )


@router.get("/{participant_id}/state", response_model=ParticipantStateResponse)
async def get_participant_state(
    study_id: int,
    participant_id: int,
    db: Session = Depends(get_session)
):
    """Get the current state of a participant for the study controller."""
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.study_id == study_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    study = db.query(Study).filter(Study.id == study_id).first()
    
    # Parse procedure to get total steps
    procedure = json.loads(study.procedure_json) if study.procedure_json else None
    steps = procedure.get("steps", []) if procedure else []

    # Get condition order and flatten procedure
    condition_order = json.loads(participant.condition_order) if participant.condition_order else []
    flat_steps = flatten_procedure(steps, condition_order)
    total_steps = len(flat_steps)

    # Determine current condition from flattened steps
    current_condition = None
    if participant.current_step < total_steps:
        current_step_data = flat_steps[participant.current_step]
        if current_step_data.get("type") == "condition":
            current_condition = current_step_data.get("title")

    return ParticipantStateResponse(
        participant_id=participant.id,
        study_id=study_id,
        study_name=study.name,
        current_step=participant.current_step,
        total_steps=total_steps,
        current_condition=current_condition,
        condition_order=condition_order,
        status=participant.status,
        procedure=procedure
    )


@router.post("/{participant_id}/advance")
async def advance_participant(
    study_id: int,
    participant_id: int,
    db: Session = Depends(get_session)
):
    """Advance participant to the next step."""
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.study_id == study_id
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Enforce pause: if currently paused and timer not expired, reject
    if participant.status == "paused" and participant.paused_until:
        now = datetime.utcnow()
        paused_until_naive = participant.paused_until.replace(tzinfo=None) if participant.paused_until.tzinfo else participant.paused_until
        if now < paused_until_naive:
            remaining = int((paused_until_naive - now).total_seconds())
            raise HTTPException(
                status_code=403,
                detail=f"Participant is paused. Resume available in {remaining} seconds."
            )
        # Timer expired: restore active status
        participant.status = "active"
        participant.paused_until = None

    study = db.query(Study).filter(Study.id == study_id).first()
    procedure = json.loads(study.procedure_json) if study.procedure_json else None
    steps = procedure.get("steps", []) if procedure else []
    condition_order = json.loads(participant.condition_order) if participant.condition_order else []
    flat_steps = flatten_procedure(steps, condition_order)
    total_steps = len(flat_steps)

    participant.current_step += 1

    # Check if study is complete
    if participant.current_step >= total_steps:
        participant.status = "completed"
        participant.completed_at = datetime.utcnow()
        participant.completion_code = generate_completion_code(study_id, participant_id)
        db.commit()
        db.refresh(participant)

        # Check for redirect URL
        config = json.loads(study.configuration_json) if study.configuration_json else {}
        redirect_url = config.get("completion_redirect_url")
        if redirect_url and participant.completion_code:
            redirect_url = redirect_url.replace("{{COMPLETION_CODE}}", participant.completion_code)

        return {
            "current_step": participant.current_step,
            "status": participant.status,
            "completed": True,
            "completion_code": participant.completion_code,
            "redirect_url": redirect_url,
            "paused": False,
            "paused_until": None,
        }

    # Check if NEW step is a pause
    new_step_data = flat_steps[participant.current_step] if participant.current_step < total_steps else None
    if new_step_data and new_step_data.get("type") == "pause":
        pause_duration = new_step_data.get("pauseDuration", 0)
        pause_unit = new_step_data.get("pauseUnit", "hours")

        if pause_duration and pause_duration > 0:
            multipliers = {"minutes": 60, "hours": 3600, "days": 86400}
            seconds = pause_duration * multipliers.get(pause_unit, 3600)
            participant.paused_until = datetime.utcnow() + timedelta(seconds=seconds)
            participant.status = "paused"

    db.commit()
    db.refresh(participant)

    return {
        "current_step": participant.current_step,
        "status": participant.status,
        "completed": False,
        "completion_code": participant.completion_code,
        "redirect_url": None,
        "paused": participant.status == "paused",
        "paused_until": participant.paused_until.isoformat() if participant.paused_until else None,
    }


@router.post("/{participant_id}/drop")
async def drop_participant(
    study_id: int,
    participant_id: int,
    db: Session = Depends(get_session)
):
    """Mark a participant as dropped."""
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.study_id == study_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    participant.status = "dropped"
    db.commit()

    return {"message": "Participant marked as dropped", "status": "dropped"}


@router.post("/{participant_id}/unpause")
async def unpause_participant(
    study_id: int,
    participant_id: int,
    db: Session = Depends(get_session)
):
    """Manually unpause a participant (experimenter action)."""
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.study_id == study_id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    participant.status = "active"
    participant.paused_until = None
    db.commit()
    return {"status": "active", "message": "Participant unpaused"}


class QuestionnaireSubmit(BaseModel):
    step_index: int
    step_title: str
    responses: dict


@router.post("/{participant_id}/questionnaire_responses", status_code=201)
async def submit_questionnaire_response(
    study_id: int,
    participant_id: int,
    body: QuestionnaireSubmit,
    db: Session = Depends(get_session)
):
    """Store questionnaire responses for a participant step."""
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.study_id == study_id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    from db.models import QuestionnaireResponse
    record = QuestionnaireResponse(
        participant_id=participant_id,
        study_id=study_id,
        step_index=body.step_index,
        step_title=body.step_title,
        responses_json=json.dumps(body.responses),
    )
    db.add(record)
    db.commit()
    return {"ok": True}


# ============================================================================
# Lookup endpoint (for participant entry)
# ============================================================================

lookup_router = APIRouter(prefix="/api/v1/participant", tags=["participants"])


@lookup_router.get("/lookup")
async def lookup_participant(
    external_id: str = Query(...),
    study_id: int = Query(...),
    db: Session = Depends(get_session)
):
    """Look up a participant by external ID."""
    participant = db.query(Participant).filter(
        Participant.external_id == external_id,
        Participant.study_id == study_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    condition_order = json.loads(participant.condition_order) if participant.condition_order else None
    
    return ParticipantResponse(
        id=participant.id,
        external_id=participant.external_id,
        external_platform=participant.external_platform,
        study_id=participant.study_id,
        condition_order=condition_order,
        current_step=participant.current_step,
        status=participant.status,
        started_at=participant.started_at,
        completed_at=participant.completed_at,
        completion_code=participant.completion_code,
        paused_until=participant.paused_until
    )
