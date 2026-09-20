from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Confirms the API is up AND can reach the database."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "unreachable"

    return {"status": "ok", "database": db_status}