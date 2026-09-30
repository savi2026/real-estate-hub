import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import require_admin
from app.schemas.admin import (
    PropertyCreate, PropertyUpdate, StatusUpdate, PropertyCreateResponse,
    AdminPropertyListResponse, AdminPropertyOut, UserProfileOut, MessageResponse, DashboardSummary,
    PromoteByEmailRequest
)
from app.services import admin_property_service, admin_user_service

router = APIRouter()
logger = logging.getLogger("admin")


@router.get("/admin/properties", response_model=AdminPropertyListResponse)
def list_properties(
    status: str | None = Query(default=None, pattern="^(active|sold|withdrawn)$"),
    property_type: str | None = Query(default=None, max_length=50),
    land_type: str | None = Query(default=None, max_length=50),
    locality: str | None = Query(default=None, max_length=100),
    min_area: float | None = Query(default=None, ge=0, le=1_000_000),
    max_area: float | None = Query(default=None, ge=0, le=1_000_000),
    min_price: float | None = Query(default=None, ge=0, le=1_000_000_000),
    max_price: float | None = Query(default=None, ge=0, le=1_000_000_000),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    try:
        rows, total = admin_property_service.list_all_properties(
            db, status, page, page_size,
            property_type=property_type, land_type=land_type, locality=locality,
            min_area=min_area, max_area=max_area, min_price=min_price, max_price=max_price,
        )
    
        return AdminPropertyListResponse(
            total=total, page=page, page_size=page_size,
            results=[AdminPropertyOut(**r) for r in rows],
        )
    except Exception:
        logger.exception("Failed to list admin properties")
        raise HTTPException(status_code=500, detail="Unable to load properties right now")


@router.post("/admin/properties", response_model=PropertyCreateResponse)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        property_id, duplicates = admin_property_service.create_property(db, payload, admin["id"])
        if property_id is None:
            return PropertyCreateResponse(
                created=False, potential_duplicates=duplicates,
                message="Possible duplicate properties found. Review and resubmit with force_add=true to add anyway.",
            )
        return PropertyCreateResponse(
            property_id=property_id, created=True, potential_duplicates=[],
            message="Property added successfully.",
        )
    except Exception:
        logger.exception("Failed to create property")
        raise HTTPException(status_code=500, detail="Unable to add property right now")


@router.put("/admin/properties/{property_id}", response_model=MessageResponse)
def update_property(property_id: str, payload: PropertyUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        updated = admin_property_service.update_property(db, property_id, payload, admin["id"])
    except Exception:
        logger.exception("Failed to update property %s", property_id)
        raise HTTPException(status_code=500, detail="Unable to update property right now")

    if not updated:
        raise HTTPException(status_code=404, detail="Property not found or no changes given")
    return MessageResponse(message="Property updated successfully.")


@router.patch("/admin/properties/{property_id}/status", response_model=MessageResponse)
def change_status(property_id: str, payload: StatusUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        updated = admin_property_service.update_status(db, property_id, payload.status, admin["id"])
    except Exception:
        logger.exception("Failed to update status for %s", property_id)
        raise HTTPException(status_code=500, detail="Unable to update status right now")

    if not updated:
        raise HTTPException(status_code=404, detail="Property not found")
    return MessageResponse(message=f"Property marked as {payload.status}.")


@router.delete("/admin/properties/{property_id}", response_model=MessageResponse)
def delete_property(property_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        deleted = admin_property_service.delete_property(db, property_id)
    except Exception:
        logger.exception("Failed to delete property %s", property_id)
        raise HTTPException(status_code=500, detail="Unable to delete property right now")

    if not deleted:
        raise HTTPException(status_code=404, detail="Property not found")
    return MessageResponse(message="Property permanently deleted.")


@router.get("/admin/users", response_model=list[UserProfileOut])
def list_users(db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        return admin_user_service.list_users(db)
    except Exception:
        logger.exception("Failed to list users")
        raise HTTPException(status_code=500, detail="Unable to load users right now")


@router.post("/admin/users/{user_id}/promote", response_model=MessageResponse)
def promote_user(user_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        ok = admin_user_service.promote_user(db, user_id)
    except Exception:
        logger.exception("Failed to promote user %s", user_id)
        raise HTTPException(status_code=500, detail="Unable to update role right now")

    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return MessageResponse(message="User promoted to admin.")


@router.post("/admin/users/{user_id}/demote", response_model=MessageResponse)
def demote_user(user_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        ok = admin_user_service.demote_user(db, user_id)
    except Exception:
        logger.exception("Failed to demote user %s", user_id)
        raise HTTPException(status_code=500, detail="Unable to update role right now")

    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return MessageResponse(message="User role set to standard user.")


@router.get("/admin/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        prop_counts = admin_property_service.get_status_counts(db)
        user_counts = admin_user_service.get_user_counts(db)
        return DashboardSummary(
            total_properties=prop_counts["total"],
            active_properties=prop_counts["active"],
            sold_properties=prop_counts["sold"],
            withdrawn_properties=prop_counts["withdrawn"],
            total_users=user_counts["total"],
            admin_users=user_counts["admin"],
        )
    except Exception:
        logger.exception("Failed to compute dashboard summary")
        raise HTTPException(status_code=500, detail="Unable to load dashboard summary right now")


@router.get("/admin/team", response_model=list[UserProfileOut])
def list_team(db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        return admin_user_service.list_admins(db)
    except Exception:
        logger.exception("Failed to list team")
        raise HTTPException(status_code=500, detail="Unable to load team right now")


@router.post("/admin/team/promote", response_model=MessageResponse)
def promote_by_email(payload: PromoteByEmailRequest, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        ok = admin_user_service.promote_user_by_email(db, payload.email)
    except Exception:
        logger.exception("Failed to promote by email")
        raise HTTPException(status_code=500, detail="Unable to update role right now")

    if not ok:
        raise HTTPException(status_code=404, detail="No registered account found with that email")
    return MessageResponse(message=f"{payload.email} is now an admin.")