"""
Data Export API for exporting study data as CSV for analysis.
"""

import csv
import io
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from db.engine import get_session
from db.models import Study, Participant, ActivityLog, SurveyResponse, QuestionnaireResponse

router = APIRouter(prefix="/api/v1/export", tags=["export"])


@router.get("/{study_id}/csv")
async def export_study_csv(
    study_id: int,
    include_logs: bool = True,
    include_surveys: bool = True,
    db: Session = Depends(get_session)
):
    """
    Export all study data as a CSV file for analysis.
    
    Includes:
    - Participant data (ID, condition assignment, status, timestamps)
    - Activity logs (queries, clicks, timestamps) if include_logs=True
    - Survey responses if include_surveys=True
    """
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    # Create CSV in memory
    output = io.StringIO()
    
    # Get all participants for this study
    participants = db.query(Participant).filter(Participant.study_id == study_id).all()
    
    if not participants:
        # Return empty CSV with headers
        writer = csv.writer(output)
        writer.writerow(["participant_id", "external_id", "status", "started_at", "completed_at", "completion_code"])
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=study_{study_id}_export.csv"}
        )
    
    # Collect all data
    rows = []
    
    for participant in participants:
        participant_base = {
            "participant_id": participant.id,
            "external_id": participant.external_id,
            "external_platform": participant.external_platform,
            "condition_order": participant.condition_order,
            "current_step": participant.current_step,
            "status": participant.status,
            "started_at": participant.started_at.isoformat() if participant.started_at else "",
            "completed_at": participant.completed_at.isoformat() if participant.completed_at else "",
            "completion_code": participant.completion_code or ""
        }
        
        if include_logs:
            # Get activity logs for this participant
            logs = db.query(ActivityLog).filter(
                ActivityLog.user_id == participant.external_id
            ).order_by(ActivityLog.timestamp).all()
            
            if logs:
                for log in logs:
                    row = participant_base.copy()
                    row.update({
                        "log_action": log.action,
                        "log_query": log.query,
                        "log_content": log.content,
                        "log_timestamp": log.timestamp,
                        "log_task_id": log.task_id
                    })
                    rows.append(row)
            else:
                # Add participant without logs
                row = participant_base.copy()
                row.update({
                    "log_action": "",
                    "log_query": "",
                    "log_content": "",
                    "log_timestamp": "",
                    "log_task_id": ""
                })
                rows.append(row)
        else:
            rows.append(participant_base)
    
    # Add survey responses if requested
    if include_surveys:
        for participant in participants:
            surveys = db.query(SurveyResponse).filter(
                SurveyResponse.user_id == participant.external_id
            ).all()
            
            for survey in surveys:
                # Parse survey content
                try:
                    content = json.loads(survey.content) if survey.content else {}
                except:
                    content = {}
                
                for row in rows:
                    if row["external_id"] == participant.external_id:
                        # Add survey response columns
                        for key, value in content.items():
                            row[f"survey_{key}"] = value

    # Add questionnaire responses (new study system)
    if include_surveys:
        for participant in participants:
            qresps = db.query(QuestionnaireResponse).filter(
                QuestionnaireResponse.participant_id == participant.id,
                QuestionnaireResponse.study_id == study_id
            ).order_by(QuestionnaireResponse.step_index).all()

            for qr in qresps:
                try:
                    answers = json.loads(qr.responses_json) if qr.responses_json else {}
                except Exception:
                    answers = {}

                for row in rows:
                    if row.get("participant_id") == participant.id:
                        for qid, answer in answers.items():
                            col_name = f"q_{qr.step_index}_{qid}"
                            row[col_name] = answer

    # Write to CSV
    if rows:
        # Get all unique keys for headers
        all_keys = set()
        for row in rows:
            all_keys.update(row.keys())
        
        # Sort headers for consistency
        headers = sorted(all_keys)
        
        writer = csv.DictWriter(output, fieldnames=headers, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)
    
    output.seek(0)
    
    # Generate filename with study name and timestamp
    safe_name = "".join(c for c in study.name if c.isalnum() or c in " -_").strip()
    safe_name = safe_name.replace(" ", "_")[:50]
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{safe_name}_{timestamp}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{study_id}/stats")
async def get_study_stats(study_id: int, db: Session = Depends(get_session)):
    """Get aggregated statistics for a study."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    participants = db.query(Participant).filter(Participant.study_id == study_id).all()
    
    if not participants:
        return {
            "study_id": study_id,
            "study_name": study.name,
            "total_participants": 0,
            "active": 0,
            "completed": 0,
            "dropped": 0,
            "completion_rate": 0.0,
            "total_interactions": 0,
            "avg_session_duration_seconds": 0
        }
    
    # Count by status
    total = len(participants)
    active = sum(1 for p in participants if p.status == "active")
    completed = sum(1 for p in participants if p.status == "completed")
    dropped = sum(1 for p in participants if p.status == "dropped")
    
    # Calculate completion rate
    completion_rate = (completed / total * 100) if total > 0 else 0.0
    
    # Get total interactions
    participant_ids = [p.external_id for p in participants]
    total_interactions = db.query(ActivityLog).filter(
        ActivityLog.user_id.in_(participant_ids)
    ).count()
    
    # Calculate average session duration for completed participants
    durations = []
    for p in participants:
        if p.status == "completed" and p.started_at and p.completed_at:
            duration = (p.completed_at - p.started_at).total_seconds()
            durations.append(duration)
    
    avg_duration = sum(durations) / len(durations) if durations else 0
    
    return {
        "study_id": study_id,
        "study_name": study.name,
        "total_participants": total,
        "active": active,
        "completed": completed,
        "dropped": dropped,
        "completion_rate": round(completion_rate, 1),
        "total_interactions": total_interactions,
        "avg_session_duration_seconds": round(avg_duration, 0)
    }


@router.get("/global/stats")
async def get_global_stats(db: Session = Depends(get_session)):
    """Get aggregated statistics across all studies."""
    studies = db.query(Study).all()
    participants = db.query(Participant).all()
    total_interactions = db.query(ActivityLog).count()
    
    completed = sum(1 for p in participants if p.status == "completed")
    total_participants = len(participants)
    
    # Calculate overall completion rate
    completion_rate = (completed / total_participants * 100) if total_participants > 0 else 0.0
    
    # Count by study status
    active_studies = sum(1 for s in studies if s.status == "active")
    draft_studies = sum(1 for s in studies if s.status == "draft")
    completed_studies = sum(1 for s in studies if s.status == "completed")
    
    return {
        "total_studies": len(studies),
        "active_studies": active_studies,
        "draft_studies": draft_studies,
        "completed_studies": completed_studies,
        "total_participants": total_participants,
        "completed_participants": completed,
        "overall_completion_rate": round(completion_rate, 1),
        "total_interactions": total_interactions
    }
