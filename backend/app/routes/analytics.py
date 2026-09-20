import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import LocalityAnalytics, PropertyTypeAnalytics
from app.services import analytics_service

router = APIRouter()
logger = logging.getLogger("analytics")


@router.get("/analytics/localities", response_model=list[LocalityAnalytics])
def locality_analytics(db: Session = Depends(get_db)):
    try:
        return analytics_service.get_locality_analytics(db)
    except Exception:
        logger.exception("Failed to fetch locality analytics")
        raise HTTPException(status_code=500, detail="Unable to load locality analytics right now")


@router.get("/analytics/property-types", response_model=list[PropertyTypeAnalytics])
def property_type_analytics(db: Session = Depends(get_db)):
    try:
        return analytics_service.get_property_type_analytics(db)
    except Exception:
        logger.exception("Failed to fetch property type analytics")
        raise HTTPException(status_code=500, detail="Unable to load property type analytics right now")