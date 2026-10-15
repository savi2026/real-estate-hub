import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.schemas.saved import SavedToggleResponse
from app.services import saved_service

router = APIRouter()
logger = logging.getLogger("saved")


@router.get("/saved", response_model=list[str])
def list_saved(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        return saved_service.list_saved_ids(db, current_user["id"])
    except Exception:
        logger.exception("Failed to list saved properties")
        raise HTTPException(status_code=500, detail="Unable to load saved properties right now")


@router.post("/saved/{property_id}/toggle", response_model=SavedToggleResponse)
def toggle_saved(property_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        saved = saved_service.toggle_saved(db, current_user["id"], property_id)
    except Exception:
        logger.exception("Failed to toggle saved property %s", property_id)
        raise HTTPException(status_code=500, detail="Unable to update saved properties right now")
    return SavedToggleResponse(saved=saved)