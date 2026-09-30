import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import LocalityAnalytics, PropertyTypeAnalytics, ListingTrendPoint, SplitItem
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

@router.get("/analytics/listing-trend", response_model=list[ListingTrendPoint])
def listing_trend(db: Session = Depends(get_db)):
    try:
        return analytics_service.get_listing_trend(db)
    except Exception:
        logger.exception("Failed to fetch listing trend")
        raise HTTPException(status_code=500, detail="Unable to load listing trend right now")

@router.get("/analytics/new-resale-split", response_model=list[SplitItem])
def new_resale_split(db: Session = Depends(get_db)):
    try:
        return analytics_service.get_new_resale_split(db)
    except Exception:
        logger.exception("Failed to fetch new/resale split")
        raise HTTPException(status_code=500, detail="Unable to load this breakdown right now")