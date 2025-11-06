import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import Base

load_dotenv()

# Check if DATABASE_URL is set (for production/Docker use)
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
    # Use PostgreSQL if explicitly configured
    pass
else:
    # Default to SQLite for local development
    # Use absolute path to ensure database is found regardless of working directory
    if os.environ.get("SQLITE_DB_PATH"):
        DB_PATH = os.environ.get("SQLITE_DB_PATH")
    else:
        # Get the project root directory (3 levels up from this file)
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        DB_PATH = str(project_root / "uxlab.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"


def create_connection_string():
    return DATABASE_URL

def test_connection():
    try:
        print(f"Database URL: {DATABASE_URL}")
        with engine.connect() as conn:
            if "sqlite" in DATABASE_URL:
                version = conn.execute(text("SELECT sqlite_version();")).fetchone()
                print(f"Connected to SQLite version: {version[0]}")
            else:
                version = conn.execute(text("SELECT version();")).fetchone()
                print(f"Connected to PostgreSQL version: {version[0]}")
            return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False


engine = create_engine(create_connection_string(), connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})


def get_session():
    with Session(engine) as session:
        yield session


if __name__ == "__main__":
    if test_connection():
        print("Connection successful.")
        Base.metadata.create_all(engine)
    else:
        print("Connection failed.")