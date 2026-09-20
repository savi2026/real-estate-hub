import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.property import (
    PropertyOut, PropertySearchRequest, PropertySearchResponse, PropertyListItem
)
from app.services import property_service

router = APIRouter()
logger = logging.getLogger("properties")


@router.get("/properties", response_model=PropertySearchResponse)
def get_properties(
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    try:
        rows, total = property_service.list_properties(db, page, page_size)
        return PropertySearchResponse(
            total=total, page=page, page_size=page_size,
            results=[PropertyListItem(**r) for r in rows],
        )
    except Exception:
        logger.exception("Failed to list properties")
        raise HTTPException(status_code=500, detail="Unable to retrieve properties right now")


@router.get("/properties/{property_id}", response_model=PropertyOut)
def get_property_detail(property_id: str = Path(..., max_length=50), db: Session = Depends(get_db)):
    try:
        row = property_service.get_property_by_id(db, property_id)
    except Exception:
        logger.exception("Failed to fetch property %s", property_id)
        raise HTTPException(status_code=500, detail="Unable to retrieve this property right now")

    if not row:
        raise HTTPException(status_code=404, detail="Property not found")
    return PropertyOut(**row)


@router.post("/properties/search", response_model=PropertySearchResponse)
def search_properties(filters: PropertySearchRequest, db: Session = Depends(get_db)):
    try:
        rows, total = property_service.search_properties(db, filters)
        return PropertySearchResponse(
            total=total, page=filters.page, page_size=filters.page_size,
            results=[PropertyListItem(**r) for r in rows],
        )
    except Exception:
        logger.exception("Property search failed")
        raise HTTPException(status_code=500, detail="Search failed — please try again")