import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user, require_admin
from app.schemas.enquiry import (
    EnquiryCreate, EnquiryOut, AdminEnquiryOut, EnquiryStatusUpdate, MyEnquiryStatus,
)
from app.schemas.admin import MessageResponse
from app.services import enquiry_service

router = APIRouter()
logger = logging.getLogger("enquiries")


@router.post("/enquiries", response_model=EnquiryOut)
def create_enquiry(payload: EnquiryCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        result = enquiry_service.create_enquiry(db, current_user["id"], payload.property_id, payload.message)
    except Exception:
        logger.exception("Failed to create enquiry")
        raise HTTPException(status_code=500, detail="Unable to send your enquiry right now")

    if result is None:
        raise HTTPException(status_code=409, detail="You already have an open enquiry for this property")
    return EnquiryOut(**result)


@router.get("/enquiries/status", response_model=MyEnquiryStatus)
def my_enquiry_status(
    property_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return MyEnquiryStatus(has_open_enquiry=enquiry_service.has_open_enquiry(db, current_user["id"], property_id))


@router.get("/enquiries/mine", response_model=list[EnquiryOut])
def my_enquiries(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        return enquiry_service.list_my_enquiries(db, current_user["id"])
    except Exception:
        logger.exception("Failed to list user enquiries")
        raise HTTPException(status_code=500, detail="Unable to load your enquiries right now")


@router.get("/admin/enquiries", response_model=list[AdminEnquiryOut])
def admin_list_enquiries(
    status: str | None = Query(default=None, pattern="^(new|contacted|closed)$"),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    try:
        return enquiry_service.list_all_enquiries(db, status)
    except Exception:
        logger.exception("Failed to list enquiries")
        raise HTTPException(status_code=500, detail="Unable to load enquiries right now")


@router.patch("/admin/enquiries/{enquiry_id}/status", response_model=MessageResponse)
def admin_update_status(enquiry_id: str, payload: EnquiryStatusUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        ok = enquiry_service.update_enquiry_status(db, enquiry_id, payload.status)
    except Exception:
        logger.exception("Failed to update enquiry status")
        raise HTTPException(status_code=500, detail="Unable to update this enquiry right now")

    if not ok:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return MessageResponse(message=f"Enquiry marked as {payload.status}.")