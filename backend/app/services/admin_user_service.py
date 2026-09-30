from sqlalchemy import text
from sqlalchemy.orm import Session


def list_users(db: Session):
    rows = db.execute(text("""
        SELECT id, user_code, email, role, full_name, age, gender, phone, profession, address
        FROM profiles ORDER BY created_at
    """)).mappings().all()
    results = []
    for r in rows:
        d = dict(r)
        d["id"] = str(d["id"])
        results.append(d)
    return results


def list_admins(db: Session):
    rows = db.execute(text("""
        SELECT id, email, role FROM profiles WHERE role = 'admin' ORDER BY created_at
    """)).mappings().all()
    results = []
    for r in rows:
        d = dict(r)
        d["id"] = str(d["id"])
        results.append(d)
    return results


def promote_user(db: Session, user_id: str):
    result = db.execute(text("UPDATE profiles SET role = 'admin' WHERE id = :id"), {"id": user_id})
    db.commit()
    return result.rowcount > 0


def promote_user_by_email(db: Session, email: str):
    result = db.execute(text("UPDATE profiles SET role = 'admin' WHERE email = :email"), {"email": email})
    db.commit()
    return result.rowcount > 0


def demote_user(db: Session, user_id: str):
    result = db.execute(text("UPDATE profiles SET role = 'user' WHERE id = :id"), {"id": user_id})
    db.commit()
    return result.rowcount > 0


def get_user_counts(db: Session):
    rows = db.execute(text("SELECT role, count(*) as count FROM profiles GROUP BY role")).mappings().all()
    counts = {"admin": 0, "user": 0}
    for r in rows:
        counts[r["role"]] = r["count"]
    counts["total"] = sum(counts.values())
    return counts