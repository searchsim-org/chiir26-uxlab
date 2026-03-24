import datetime
import json

from sqlalchemy import ARRAY, DateTime, Enum, ForeignKey, String, func, Integer, Text, JSON
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import Mapped, declarative_base, mapped_column, relationship

try:
    from ..schemas import MessageRole
except ImportError:
    from backend.schemas import MessageRole

Base = declarative_base()


class ActivityLog(Base):
    __tablename__ = "activity_log"
    id = mapped_column(primary_key=True, type_=Integer)
    user_id = mapped_column(String)
    task_id = mapped_column(String)
    action = mapped_column(String)
    query = mapped_column(String)
    content = mapped_column(String)
    timestamp = mapped_column(Integer)
    
    
class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String)
    timestamp: Mapped[int] = mapped_column(Integer)
    tasks: Mapped[str] = mapped_column(Text)  # Store as JSON string for SQLite compatibility
    content: Mapped[str] = mapped_column(Text)  # Store as JSON string for SQLite compatibility
    

class ChatThread(Base):
    __tablename__ = "chat_thread"
    id: Mapped[int] = mapped_column(primary_key=True)

    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="chat_thread"
    )
    model_name: Mapped[str] = mapped_column(String)

    time_updated: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    time_created: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class SearchResult(Base):
    __tablename__ = "search_result"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(String)

    chat_message_id: Mapped[int] = mapped_column(ForeignKey("chat_message.id"))
    chat_message: Mapped["ChatMessage"] = relationship(
        "ChatMessage", back_populates="search_results"
    )


class ChatMessage(Base):
    __tablename__ = "chat_message"
    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole))
    content: Mapped[str] = mapped_column(String)
    parent_message_id: Mapped[int | None] = mapped_column(
        ForeignKey("chat_message.id"), nullable=True
    )

    chat_thread_id: Mapped[int] = mapped_column(ForeignKey("chat_thread.id"))
    chat_thread: Mapped[ChatThread] = relationship(
        ChatThread, back_populates="messages"
    )

    # AI Only - Store as JSON strings for SQLite compatibility
    agent_search_full_response: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    related_queries: Mapped[str | None] = mapped_column(
        Text, nullable=True  # Store as JSON string
    )
    image_results: Mapped[str | None] = mapped_column(
        Text, nullable=True  # Store as JSON string
    )

    search_results: Mapped[list[SearchResult] | None] = relationship(
        SearchResult, back_populates="chat_message"
    )


class User(Base):
    """Represents an authenticated user (experimenter)."""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    github_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    username: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    access_token: Mapped[str | None] = mapped_column(Text, nullable=True)  # Encrypted
    
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_login: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Study(Base):
    """Represents a user study configuration."""
    __tablename__ = "studies"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, active, paused, completed
    design_type: Mapped[str] = mapped_column(String(50), default="within-subject")  # within-subject, between-subject, time-series
    target_participants: Mapped[int] = mapped_column(Integer, default=0)
    
    # Configuration stored as JSON
    configuration_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    procedure_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # Study procedure steps
    
    # Timestamps
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    participants: Mapped[list["Participant"]] = relationship(
        "Participant", back_populates="study"
    )
    conditions: Mapped[list["StudyCondition"]] = relationship(
        "StudyCondition", back_populates="study"
    )


class Participant(Base):
    """Tracks participant progress and condition assignment."""
    __tablename__ = "participants"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(255))  # Prolific/MTurk/UUID
    external_platform: Mapped[str | None] = mapped_column(String(50), nullable=True)  # prolific, mturk, etc.
    
    study_id: Mapped[int] = mapped_column(ForeignKey("studies.id"))
    study: Mapped["Study"] = relationship("Study", back_populates="participants")
    
    # Counterbalancing - stores the assigned order of conditions as JSON array
    condition_order: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Progress tracking
    current_step: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="active")  # active, completed, dropped, paused
    
    # Timestamps
    started_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    
    # Session metadata
    completion_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    paused_until: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class StudyCondition(Base):
    """Links a study to a backend configuration (condition)."""
    __tablename__ = "study_conditions"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    study_id: Mapped[int] = mapped_column(ForeignKey("studies.id"))
    study: Mapped["Study"] = relationship("Study", back_populates="conditions")
    
    backend_config_id: Mapped[int] = mapped_column(ForeignKey("backend_configs.id"))
    backend_config: Mapped["BackendConfig"] = relationship("BackendConfig")
    
    name: Mapped[str] = mapped_column(String(255))  # e.g., "Condition A: RAG System"
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)  # For ordering in UI


class BackendConfig(Base):
    """Stores configuration for a backend service connector."""
    __tablename__ = "backend_configs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))  # User-friendly name
    connector_type: Mapped[str] = mapped_column(String(50))  # openai, openai_agentic, bing, tavily, ollama, custom
    
    # Configuration stored as JSON (API keys, endpoints, prompts, etc.)
    config_json: Mapped[str] = mapped_column(Text)
    
    # Health monitoring
    health_status: Mapped[str] = mapped_column(String(50), default="unknown")  # healthy, unhealthy, unknown
    last_health_check: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class QuestionnaireResponse(Base):
    """Stores participant responses to a questionnaire step."""
    __tablename__ = "questionnaire_responses"

    id: Mapped[int] = mapped_column(primary_key=True)
    participant_id: Mapped[int] = mapped_column(ForeignKey("participants.id"), index=True)
    study_id: Mapped[int] = mapped_column(Integer, index=True)
    step_index: Mapped[int] = mapped_column(Integer)
    step_title: Mapped[str] = mapped_column(String(255))
    responses_json: Mapped[str] = mapped_column(Text)  # JSON: { question_id: answer }
    submitted_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
