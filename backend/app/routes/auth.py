import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.database import get_db
from app.schemas.admin import UserProfileOut, ProfileUpdateRequest

router = APIRouter()
logger = logging.getLogger("auth_route")


@router.get("/auth/me", response_model=UserProfileOut)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserProfileOut(**current_user)


@router.patch("/auth/me", response_model=UserProfileOut)
def update_me(
    payload: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fields = payload.model_dump(exclude_unset=True)
    if not fields:
        return UserProfileOut(**current_user)

    try:
        set_clause = ", ".join([f"{k} = :{k}" for k in fields.keys()])
        fields["id"] = current_user["id"]
        db.execute(text(f"UPDATE profiles SET {set_clause} WHERE id = :id"), fields)
        db.commit()
    except Exception:
        logger.exception("Failed to update profile for %s", current_user["id"])
        raise HTTPException(status_code=500, detail="Unable to update your profile right now")

    row = db.execute(
        text("""
            SELECT id, user_code, email, role, full_name, age, gender, phone, profession, address
            FROM profiles WHERE id = :id
        """),
        {"id": current_user["id"]},
    ).mappings().first()
    result = dict(row)
    result["id"] = str(result["id"])
    return UserProfileOut(**result)