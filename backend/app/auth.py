import logging
import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import get_db

logger = logging.getLogger("auth")

_jwks_client = PyJWKClient(f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json")


def get_current_user(authorization: str = Header(default=None), db: Session = Depends(get_db)):
    """Verifies a Supabase-issued login token against Supabase's public signing keys."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as e:
        logger.warning("JWT verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    row = db.execute(
        text("""
            SELECT id, user_code, email, role, full_name, age, gender, phone, profession, address
            FROM profiles WHERE id = :id
        """),
        {"id": user_id},
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=401, detail="No profile found for this account")

    result = dict(row)
    result["id"] = str(result["id"])
    return result


def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user