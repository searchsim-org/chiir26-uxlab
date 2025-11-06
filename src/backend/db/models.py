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
