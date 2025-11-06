import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import Base

load_dotenv()

POSTGRES_USER = os.environ.get("POSTGRES_USER") or "postgres"
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD") or "password"
POSTGRES_HOST = os.environ.get("POSTGRES_HOST") or "localhost"
POSTGRES_PORT = os.environ.get("POSTGRES_PORT") or "5432"
POSTGRES_DB = os.environ.get("POSTGRES_DB") or "postgres"

DATABASE_URL = (
    os.environ.get("DATABASE_URL")
    or f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)


def create_connection_string():
    return DATABASE_URL

def test_connection():
    try:
        with engine.connect() as conn:
            version = conn.execute(text("SELECT version();")).fetchone()
            print(f"Connected to PostgreSQL version: {version[0]}")
            return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False


engine = create_engine(create_connection_string())


def get_session():
    with Session(engine) as session:
        yield session


if __name__ == "__main__":
    if test_connection():
        print("Connection successful.")
        Base.metadata.create_all(engine)
    else:
        print("Connection failed.")