"""
Backend Configuration API endpoints for managing service connectors.
"""

import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.engine import get_session
from db.models import BackendConfig

router = APIRouter(prefix="/api/v1/backends", tags=["backends"])


# ============================================================================
# Pydantic Schemas
# ============================================================================

class BackendCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    connector_type: str = Field(..., description="Type of connector: openai, openai_agentic, bing, tavily, ollama, custom")
    config_json: str = Field(..., description="JSON string with connector configuration")


class BackendUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    connector_type: Optional[str] = None
    config_json: Optional[str] = None


class BackendResponse(BaseModel):
    id: int
    name: str
    connector_type: str
    config_json: str
    health_status: str
    last_health_check: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BackendListResponse(BaseModel):
    backends: List[BackendResponse]
    total: int


class HealthCheckResponse(BaseModel):
    status: str
    message: str
    checked_at: datetime


# ============================================================================
# Connector Configuration Schemas
# ============================================================================

CONNECTOR_SCHEMAS = {
    "openai": {
        "required": ["api_key"],
        "optional": ["model", "temperature", "max_tokens", "system_prompt"],
        "defaults": {
            "model": "gpt-4-turbo-preview",
            "temperature": 0.7,
            "max_tokens": 4096
        }
    },
    "openai_agentic": {
        "required": ["api_key"],
        "optional": ["model", "temperature", "max_tokens", "system_prompt", "tools_enabled"],
        "defaults": {
            "model": "gpt-4-turbo-preview",
            "temperature": 0.7,
            "max_tokens": 4096,
            "tools_enabled": True
        }
    },
    "bing": {
        "required": ["api_key"],
        "optional": ["market", "count"],
        "defaults": {
            "market": "en-US",
            "count": 10
        }
    },
    "tavily": {
        "required": ["api_key"],
        "optional": ["search_depth", "max_results"],
        "defaults": {
            "search_depth": "basic",
            "max_results": 6
        }
    },
    "ollama": {
        "required": ["base_url", "model"],
        "optional": ["temperature", "max_tokens"],
        "defaults": {
            "base_url": "http://localhost:11434",
            "temperature": 0.7,
            "max_tokens": 4096
        }
    },
    "groq": {
        "required": ["api_key"],
        "optional": ["model", "temperature", "max_tokens"],
        "defaults": {
            "model": "llama3-70b-8192",
            "temperature": 0.7,
            "max_tokens": 4096
        }
    },
    "custom": {
        "required": ["endpoint_url"],
        "optional": ["api_key", "headers", "method"],
        "defaults": {
            "method": "POST"
        }
    }
}


@router.get("/schemas")
async def get_connector_schemas():
    """Get configuration schemas for all connector types."""
    return CONNECTOR_SCHEMAS


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("", response_model=BackendResponse)
async def create_backend(backend: BackendCreate, db: Session = Depends(get_session)):
    """Create a new backend configuration."""
    # Validate connector type
    if backend.connector_type not in CONNECTOR_SCHEMAS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid connector type. Must be one of: {list(CONNECTOR_SCHEMAS.keys())}"
        )
    
    # Validate config JSON
    try:
        config = json.loads(backend.config_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in config_json")
    
    # Check required fields
    schema = CONNECTOR_SCHEMAS[backend.connector_type]
    missing = [f for f in schema["required"] if f not in config]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields for {backend.connector_type}: {missing}"
        )
    
    new_backend = BackendConfig(
        name=backend.name,
        connector_type=backend.connector_type,
        config_json=backend.config_json,
        health_status="unknown"
    )
    db.add(new_backend)
    db.commit()
    db.refresh(new_backend)
    
    return BackendResponse(
        id=new_backend.id,
        name=new_backend.name,
        connector_type=new_backend.connector_type,
        config_json=new_backend.config_json,
        health_status=new_backend.health_status,
        last_health_check=new_backend.last_health_check,
        created_at=new_backend.created_at,
        updated_at=new_backend.updated_at
    )


@router.get("", response_model=BackendListResponse)
async def list_backends(db: Session = Depends(get_session)):
    """List all backend configurations."""
    backends = db.query(BackendConfig).order_by(BackendConfig.name).all()
    
    backend_responses = [
        BackendResponse(
            id=b.id,
            name=b.name,
            connector_type=b.connector_type,
            config_json=b.config_json,
            health_status=b.health_status,
            last_health_check=b.last_health_check,
            created_at=b.created_at,
            updated_at=b.updated_at
        )
        for b in backends
    ]
    
    return BackendListResponse(backends=backend_responses, total=len(backend_responses))


@router.get("/{backend_id}", response_model=BackendResponse)
async def get_backend(backend_id: int, db: Session = Depends(get_session)):
    """Get a specific backend configuration."""
    backend = db.query(BackendConfig).filter(BackendConfig.id == backend_id).first()
    if not backend:
        raise HTTPException(status_code=404, detail="Backend not found")
    
    return BackendResponse(
        id=backend.id,
        name=backend.name,
        connector_type=backend.connector_type,
        config_json=backend.config_json,
        health_status=backend.health_status,
        last_health_check=backend.last_health_check,
        created_at=backend.created_at,
        updated_at=backend.updated_at
    )


@router.put("/{backend_id}", response_model=BackendResponse)
async def update_backend(
    backend_id: int,
    backend_update: BackendUpdate,
    db: Session = Depends(get_session)
):
    """Update a backend configuration."""
    backend = db.query(BackendConfig).filter(BackendConfig.id == backend_id).first()
    if not backend:
        raise HTTPException(status_code=404, detail="Backend not found")
    
    update_data = backend_update.model_dump(exclude_unset=True)
    
    # Validate connector type if being updated
    if "connector_type" in update_data and update_data["connector_type"] not in CONNECTOR_SCHEMAS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid connector type. Must be one of: {list(CONNECTOR_SCHEMAS.keys())}"
        )
    
    # Validate config JSON if being updated
    if "config_json" in update_data:
        try:
            json.loads(update_data["config_json"])
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in config_json")
    
    for key, value in update_data.items():
        setattr(backend, key, value)
    
    db.commit()
    db.refresh(backend)
    
    return BackendResponse(
        id=backend.id,
        name=backend.name,
        connector_type=backend.connector_type,
        config_json=backend.config_json,
        health_status=backend.health_status,
        last_health_check=backend.last_health_check,
        created_at=backend.created_at,
        updated_at=backend.updated_at
    )


@router.delete("/{backend_id}")
async def delete_backend(backend_id: int, db: Session = Depends(get_session)):
    """Delete a backend configuration."""
    backend = db.query(BackendConfig).filter(BackendConfig.id == backend_id).first()
    if not backend:
        raise HTTPException(status_code=404, detail="Backend not found")
    
    db.delete(backend)
    db.commit()
    
    return {"message": "Backend deleted successfully"}


@router.post("/{backend_id}/test", response_model=HealthCheckResponse)
async def test_backend(backend_id: int, db: Session = Depends(get_session)):
    """Test a backend connection and update health status."""
    backend = db.query(BackendConfig).filter(BackendConfig.id == backend_id).first()
    if not backend:
        raise HTTPException(status_code=404, detail="Backend not found")
    
    config = json.loads(backend.config_json)
    now = datetime.utcnow()
    
    try:
        # Perform health check based on connector type
        if backend.connector_type == "openai" or backend.connector_type == "openai_agentic":
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {config.get('api_key', '')}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    backend.health_status = "healthy"
                    message = "OpenAI API connection successful"
                else:
                    backend.health_status = "unhealthy"
                    message = f"OpenAI API returned status {response.status_code}"
        
        elif backend.connector_type == "bing":
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.bing.microsoft.com/v7.0/search",
                    headers={"Ocp-Apim-Subscription-Key": config.get("api_key", "")},
                    params={"q": "test"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    backend.health_status = "healthy"
                    message = "Bing API connection successful"
                else:
                    backend.health_status = "unhealthy"
                    message = f"Bing API returned status {response.status_code}"
        
        elif backend.connector_type == "ollama":
            import httpx
            base_url = config.get("base_url", "http://localhost:11434")
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{base_url}/api/tags", timeout=10.0)
                if response.status_code == 200:
                    backend.health_status = "healthy"
                    message = "Ollama connection successful"
                else:
                    backend.health_status = "unhealthy"
                    message = f"Ollama returned status {response.status_code}"
        
        elif backend.connector_type == "tavily":
            # Tavily doesn't have a dedicated health endpoint, mark as unknown
            backend.health_status = "unknown"
            message = "Tavily health check not available, API key stored"
        
        else:
            backend.health_status = "unknown"
            message = f"Health check not implemented for {backend.connector_type}"
        
        backend.last_health_check = now
        db.commit()
        
        return HealthCheckResponse(
            status=backend.health_status,
            message=message,
            checked_at=now
        )
        
    except Exception as e:
        backend.health_status = "unhealthy"
        backend.last_health_check = now
        db.commit()
        
        return HealthCheckResponse(
            status="unhealthy",
            message=str(e),
            checked_at=now
        )
