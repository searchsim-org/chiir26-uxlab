from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request
from typing import List
from sqlalchemy.orm import Session
from db.engine import get_session
from db.log_utils import insert_log_entry
from schemas import LogEntry, SurveyResponseEntry
from db.models import SurveyResponse
from pydantic import parse_obj_as

# Define the router
router = APIRouter()

@router.post("/api/v1/log_activity")
async def log_activity(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    raw_data = await request.json()
    log_entries = parse_obj_as(List[LogEntry], [raw_data]) 
    try:
        for entry in log_entries:
            background_tasks.add_task(insert_log_entry, db, entry)
        return {"message": "Log entries are being processed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.post("/api/v1/survey_responses")
async def store_survey_response(response_entry: SurveyResponseEntry, db: Session = Depends(get_session)):
    new_response = SurveyResponse(
        user_id=response_entry.user_id,
        timestamp=response_entry.timestamp,
        tasks=response_entry.tasks,
        content=response_entry.content
    )
    db.add(new_response)
    db.commit()
    return {"message": "Survey response stored successfully."}