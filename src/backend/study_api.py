"""
Study API endpoints for creating, managing, and exporting studies.
"""

import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.engine import get_session
from db.models import Study, Participant, StudyCondition, BackendConfig


def sync_study_conditions(study_id: int, procedure_json: str, db: Session):
    """
    Synchronize StudyCondition rows based on the procedure's condition steps.
    Extracts all condition steps (including block children) from procedure_json,
    upserts StudyCondition rows, and deletes any that no longer match.
    """
    try:
        procedure = json.loads(procedure_json)
    except (json.JSONDecodeError, TypeError):
        return

    steps = procedure.get("steps", [])
    conditions = []
    order_index = 0

    for step in steps:
        if step.get("type") == "condition" and step.get("backend_config_id"):
            conditions.append({
                "name": step.get("title", f"Condition {order_index + 1}"),
                "backend_config_id": step["backend_config_id"],
                "order_index": order_index,
            })
            order_index += 1
        elif step.get("type") == "block":
            for child in step.get("children", []):
                if child.get("type") == "condition" and child.get("backend_config_id"):
                    conditions.append({
                        "name": child.get("title", f"Condition {order_index + 1}"),
                        "backend_config_id": child["backend_config_id"],
                        "order_index": order_index,
                    })
                    order_index += 1

    existing = db.query(StudyCondition).filter(
        StudyCondition.study_id == study_id
    ).all()
    existing_by_name = {c.name: c for c in existing}

    new_names = set()
    for cond in conditions:
        new_names.add(cond["name"])
        if cond["name"] in existing_by_name:
            existing_cond = existing_by_name[cond["name"]]
            existing_cond.backend_config_id = cond["backend_config_id"]
            existing_cond.order_index = cond["order_index"]
        else:
            new_cond = StudyCondition(
                study_id=study_id,
                name=cond["name"],
                backend_config_id=cond["backend_config_id"],
                order_index=cond["order_index"],
            )
            db.add(new_cond)

    for name, existing_cond in existing_by_name.items():
        if name not in new_names:
            db.delete(existing_cond)


router = APIRouter(prefix="/api/v1/studies", tags=["studies"])


# ============================================================================
# Pydantic Schemas
# ============================================================================

class StudyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    design_type: str = Field(default="within-subject")  # within-subject, between-subject, time-series
    target_participants: int = Field(default=0, ge=0)
    configuration_json: Optional[str] = None
    procedure_json: Optional[str] = None


class StudyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    design_type: Optional[str] = None
    target_participants: Optional[int] = Field(None, ge=0)
    configuration_json: Optional[str] = None
    procedure_json: Optional[str] = None


class StudyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    design_type: str
    target_participants: int
    configuration_json: Optional[str]
    procedure_json: Optional[str]
    created_at: datetime
    updated_at: datetime
    participant_count: int = 0
    completion_rate: float = 0.0
    
    class Config:
        from_attributes = True


class StudyListResponse(BaseModel):
    studies: List[StudyResponse]
    total: int


class ConditionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    backend_config_id: int
    order_index: int = 0


class ConditionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    backend_config_id: int
    order_index: int
    
    class Config:
        from_attributes = True


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("", response_model=StudyResponse)
async def create_study(study: StudyCreate, db: Session = Depends(get_session)):
    """Create a new study."""
    new_study = Study(
        name=study.name,
        description=study.description,
        design_type=study.design_type,
        target_participants=study.target_participants,
        configuration_json=study.configuration_json,
        procedure_json=study.procedure_json,
        status="draft"
    )
    db.add(new_study)
    db.commit()
    db.refresh(new_study)
    
    return StudyResponse(
        id=new_study.id,
        name=new_study.name,
        description=new_study.description,
        status=new_study.status,
        design_type=new_study.design_type,
        target_participants=new_study.target_participants,
        configuration_json=new_study.configuration_json,
        procedure_json=new_study.procedure_json,
        created_at=new_study.created_at,
        updated_at=new_study.updated_at,
        participant_count=0,
        completion_rate=0.0
    )


@router.get("", response_model=StudyListResponse)
async def list_studies(db: Session = Depends(get_session)):
    """List all studies with participant counts."""
    studies = db.query(Study).order_by(Study.updated_at.desc()).all()
    
    study_responses = []
    for study in studies:
        participant_count = len(study.participants) if study.participants else 0
        completed_count = sum(1 for p in study.participants if p.status == "completed") if study.participants else 0
        completion_rate = (completed_count / participant_count * 100) if participant_count > 0 else 0.0
        
        study_responses.append(StudyResponse(
            id=study.id,
            name=study.name,
            description=study.description,
            status=study.status,
            design_type=study.design_type,
            target_participants=study.target_participants,
            configuration_json=study.configuration_json,
            procedure_json=study.procedure_json,
            created_at=study.created_at,
            updated_at=study.updated_at,
            participant_count=participant_count,
            completion_rate=completion_rate
        ))
    
    return StudyListResponse(studies=study_responses, total=len(study_responses))


@router.get("/{study_id}", response_model=StudyResponse)
async def get_study(study_id: int, db: Session = Depends(get_session)):
    """Get a specific study by ID."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    participant_count = len(study.participants) if study.participants else 0
    completed_count = sum(1 for p in study.participants if p.status == "completed") if study.participants else 0
    completion_rate = (completed_count / participant_count * 100) if participant_count > 0 else 0.0
    
    return StudyResponse(
        id=study.id,
        name=study.name,
        description=study.description,
        status=study.status,
        design_type=study.design_type,
        target_participants=study.target_participants,
        configuration_json=study.configuration_json,
        procedure_json=study.procedure_json,
        created_at=study.created_at,
        updated_at=study.updated_at,
        participant_count=participant_count,
        completion_rate=completion_rate
    )


@router.put("/{study_id}", response_model=StudyResponse)
async def update_study(
    study_id: int, 
    study_update: StudyUpdate, 
    db: Session = Depends(get_session)
):
    """Update a study."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    update_data = study_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(study, key, value)

    db.commit()

    # Sync study conditions if procedure was updated
    if study_update.procedure_json is not None:
        sync_study_conditions(study_id, study.procedure_json, db)
        db.commit()

    db.refresh(study)
    
    participant_count = len(study.participants) if study.participants else 0
    completed_count = sum(1 for p in study.participants if p.status == "completed") if study.participants else 0
    completion_rate = (completed_count / participant_count * 100) if participant_count > 0 else 0.0
    
    return StudyResponse(
        id=study.id,
        name=study.name,
        description=study.description,
        status=study.status,
        design_type=study.design_type,
        target_participants=study.target_participants,
        configuration_json=study.configuration_json,
        procedure_json=study.procedure_json,
        created_at=study.created_at,
        updated_at=study.updated_at,
        participant_count=participant_count,
        completion_rate=completion_rate
    )


@router.delete("/{study_id}")
async def delete_study(study_id: int, db: Session = Depends(get_session)):
    """Delete a study."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    # Delete related records first
    db.query(StudyCondition).filter(StudyCondition.study_id == study_id).delete()
    db.query(Participant).filter(Participant.study_id == study_id).delete()
    
    db.delete(study)
    db.commit()
    
    return {"message": "Study deleted successfully"}


@router.post("/{study_id}/duplicate", response_model=StudyResponse)
async def duplicate_study(study_id: int, db: Session = Depends(get_session)):
    """Duplicate a study with a new name."""
    original = db.query(Study).filter(Study.id == study_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Study not found")
    
    new_study = Study(
        name=f"{original.name} (Copy)",
        description=original.description,
        design_type=original.design_type,
        target_participants=original.target_participants,
        configuration_json=original.configuration_json,
        procedure_json=original.procedure_json,
        status="draft"
    )
    db.add(new_study)
    db.commit()
    db.refresh(new_study)
    
    # Duplicate conditions
    original_conditions = db.query(StudyCondition).filter(
        StudyCondition.study_id == study_id
    ).all()
    
    for cond in original_conditions:
        new_cond = StudyCondition(
            study_id=new_study.id,
            backend_config_id=cond.backend_config_id,
            name=cond.name,
            description=cond.description,
            order_index=cond.order_index
        )
        db.add(new_cond)
    
    db.commit()
    
    return StudyResponse(
        id=new_study.id,
        name=new_study.name,
        description=new_study.description,
        status=new_study.status,
        design_type=new_study.design_type,
        target_participants=new_study.target_participants,
        configuration_json=new_study.configuration_json,
        procedure_json=new_study.procedure_json,
        created_at=new_study.created_at,
        updated_at=new_study.updated_at,
        participant_count=0,
        completion_rate=0.0
    )


@router.post("/{study_id}/activate")
async def activate_study(study_id: int, db: Session = Depends(get_session)):
    """Activate a study for participant recruitment."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    study.status = "active"
    db.commit()
    
    return {"message": "Study activated", "status": "active"}


@router.post("/{study_id}/pause")
async def pause_study(study_id: int, db: Session = Depends(get_session)):
    """Pause an active study."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    study.status = "paused"
    db.commit()
    
    return {"message": "Study paused", "status": "paused"}


@router.get("/{study_id}/export/json")
async def export_study_config(study_id: int, db: Session = Depends(get_session)):
    """Export complete study configuration as JSON for reproducibility."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    conditions = db.query(StudyCondition).filter(
        StudyCondition.study_id == study_id
    ).all()
    
    # Get backend configs for conditions
    condition_exports = []
    for cond in conditions:
        backend = db.query(BackendConfig).filter(
            BackendConfig.id == cond.backend_config_id
        ).first()
        
        condition_exports.append({
            "name": cond.name,
            "description": cond.description,
            "order_index": cond.order_index,
            "backend": {
                "name": backend.name if backend else None,
                "connector_type": backend.connector_type if backend else None,
                "config": json.loads(backend.config_json) if backend and backend.config_json else None
            }
        })
    
    export_data = {
        "uxlab_version": "1.0",
        "exported_at": datetime.utcnow().isoformat(),
        "study": {
            "name": study.name,
            "description": study.description,
            "design_type": study.design_type,
            "target_participants": study.target_participants,
            "configuration": json.loads(study.configuration_json) if study.configuration_json else None,
            "procedure": json.loads(study.procedure_json) if study.procedure_json else None
        },
        "conditions": condition_exports
    }
    
    return export_data


class StudyImport(BaseModel):
    uxlab_version: str
    study: dict
    conditions: List[dict] = []


@router.post("/import", response_model=StudyResponse)
async def import_study_config(
    import_data: StudyImport, 
    db: Session = Depends(get_session)
):
    """Import a study from exported JSON configuration."""
    study_data = import_data.study
    
    new_study = Study(
        name=f"{study_data.get('name', 'Imported Study')} (Imported)",
        description=study_data.get('description'),
        design_type=study_data.get('design_type', 'within-subject'),
        target_participants=study_data.get('target_participants', 0),
        configuration_json=json.dumps(study_data.get('configuration')) if study_data.get('configuration') else None,
        procedure_json=json.dumps(study_data.get('procedure')) if study_data.get('procedure') else None,
        status="draft"
    )
    db.add(new_study)
    db.commit()
    db.refresh(new_study)
    
    # Note: Backend configs need to be created separately or matched by name
    # For now, we import the conditions without backend links
    
    return StudyResponse(
        id=new_study.id,
        name=new_study.name,
        description=new_study.description,
        status=new_study.status,
        design_type=new_study.design_type,
        target_participants=new_study.target_participants,
        configuration_json=new_study.configuration_json,
        procedure_json=new_study.procedure_json,
        created_at=new_study.created_at,
        updated_at=new_study.updated_at,
        participant_count=0,
        completion_rate=0.0
    )


# ============================================================================
# Condition Management
# ============================================================================

@router.get("/{study_id}/conditions", response_model=List[ConditionResponse])
async def list_conditions(study_id: int, db: Session = Depends(get_session)):
    """List all conditions for a study."""
    conditions = db.query(StudyCondition).filter(
        StudyCondition.study_id == study_id
    ).order_by(StudyCondition.order_index).all()
    
    return [ConditionResponse(
        id=c.id,
        name=c.name,
        description=c.description,
        backend_config_id=c.backend_config_id,
        order_index=c.order_index
    ) for c in conditions]


@router.post("/{study_id}/conditions", response_model=ConditionResponse)
async def add_condition(
    study_id: int,
    condition: ConditionCreate,
    db: Session = Depends(get_session)
):
    """Add a condition to a study."""
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    backend = db.query(BackendConfig).filter(
        BackendConfig.id == condition.backend_config_id
    ).first()
    if not backend:
        raise HTTPException(status_code=404, detail="Backend configuration not found")
    
    new_condition = StudyCondition(
        study_id=study_id,
        backend_config_id=condition.backend_config_id,
        name=condition.name,
        description=condition.description,
        order_index=condition.order_index
    )
    db.add(new_condition)
    db.commit()
    db.refresh(new_condition)
    
    return ConditionResponse(
        id=new_condition.id,
        name=new_condition.name,
        description=new_condition.description,
        backend_config_id=new_condition.backend_config_id,
        order_index=new_condition.order_index
    )


@router.delete("/{study_id}/conditions/{condition_id}")
async def remove_condition(
    study_id: int,
    condition_id: int,
    db: Session = Depends(get_session)
):
    """Remove a condition from a study."""
    condition = db.query(StudyCondition).filter(
        StudyCondition.id == condition_id,
        StudyCondition.study_id == study_id
    ).first()
    
    if not condition:
        raise HTTPException(status_code=404, detail="Condition not found")
    
    db.delete(condition)
    db.commit()
    
    return {"message": "Condition removed successfully"}
