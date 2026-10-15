from sqlalchemy import text
from sqlalchemy.orm import Session


def list_saved_ids(db: Session, user_id: str) -> list[str]:
    rows = db.execute(
        text("SELECT property_id FROM saved_properties WHERE user_id = :user_id ORDER BY created_at DESC"),
        {"user_id": user_id},
    ).all()
    return [r[0] for r in rows]


def toggle_saved(db: Session, user_id: str, property_id: str) -> bool:
    existing = db.execute(
        text("SELECT id FROM saved_properties WHERE user_id = :user_id AND property_id = :property_id"),
        {"user_id": user_id, "property_id": property_id},
    ).first()

    if existing:
        db.execute(
            text("DELETE FROM saved_properties WHERE user_id = :user_id AND property_id = :property_id"),
            {"user_id": user_id, "property_id": property_id},
        )
        db.commit()
        return False

    db.execute(
        text("INSERT INTO saved_properties (user_id, property_id) VALUES (:user_id, :property_id)"),
        {"user_id": user_id, "property_id": property_id},
    )
    db.commit()
    return True