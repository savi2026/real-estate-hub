from sqlalchemy import text
from sqlalchemy.orm import Session


def create_enquiry(db: Session, user_id: str, property_id: str, message: str | None):
    # Block a duplicate only if the user already has a non-closed enquiry for this property
    existing = db.execute(
        text("""
            SELECT id FROM enquiries
            WHERE user_id = :user_id AND property_id = :property_id AND status != 'closed'
        """),
        {"user_id": user_id, "property_id": property_id},
    ).first()
    if existing:
        return None

    row = db.execute(
        text("""
            INSERT INTO enquiries (user_id, property_id, message)
            VALUES (:user_id, :property_id, :message)
            RETURNING id, property_id, message, status, created_at
        """),
        {"user_id": user_id, "property_id": property_id, "message": message},
    ).mappings().first()
    db.commit()
    result = dict(row)
    result["id"] = str(result["id"])
    return result


def has_open_enquiry(db: Session, user_id: str, property_id: str) -> bool:
    row = db.execute(
        text("""
            SELECT id FROM enquiries
            WHERE user_id = :user_id AND property_id = :property_id AND status != 'closed'
        """),
        {"user_id": user_id, "property_id": property_id},
    ).first()
    return row is not None


def list_my_enquiries(db: Session, user_id: str):
    rows = db.execute(
        text("""
            SELECT id, property_id, message, status, created_at
            FROM enquiries WHERE user_id = :user_id ORDER BY created_at DESC
        """),
        {"user_id": user_id},
    ).mappings().all()
    results = []
    for r in rows:
        d = dict(r)
        d["id"] = str(d["id"])
        results.append(d)
    return results


def list_all_enquiries(db: Session, status_filter: str | None):
    where = "WHERE e.status = :status" if status_filter else ""
    params = {"status": status_filter} if status_filter else {}

    rows = db.execute(
        text(f"""
            SELECT e.id, e.property_id, p.locality, e.message, e.status, e.created_at,
                   pr.user_code, pr.full_name, pr.email, pr.phone
            FROM enquiries e
            JOIN properties p ON p.property_id = e.property_id
            JOIN profiles pr ON pr.id = e.user_id
            {where}
            ORDER BY e.created_at DESC
        """),
        params,
    ).mappings().all()
    results = []
    for r in rows:
        d = dict(r)
        d["id"] = str(d["id"])
        results.append(d)
    return results


def update_enquiry_status(db: Session, enquiry_id: str, status: str):
    result = db.execute(
        text("UPDATE enquiries SET status = :status, updated_at = now() WHERE id = :id"),
        {"status": status, "id": enquiry_id},
    )
    db.commit()
    return result.rowcount > 0