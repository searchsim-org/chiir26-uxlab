from sqlalchemy.orm import Session
from .models import ActivityLog
from schemas import LogEntry

def insert_log_entry(session: Session, log_entry: LogEntry):
    new_log = ActivityLog(
        user_id=log_entry.user_id,
        task_id=log_entry.task_id,
        query=log_entry.query,
        action=log_entry.action,
        content=log_entry.content,
        timestamp=log_entry.timestamp
    )
    session.add(new_log)
    session.commit()