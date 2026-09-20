import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.matching import MatchRequest, MatchResponse, MatchedProperty
from app.services import matching_service

router = APIRouter()
logger = logging.getLogger("matching")


@router.post("/match", response_model=MatchResponse)
def match_properties(req: MatchRequest, db: Session = Depends(get_db)):
    try:
        total, ranked = matching_service.run_match(db, req)
        return MatchResponse(
            total_candidates=total,
            returned=len(ranked),
            results=[MatchedProperty(**r) for r in ranked],
        )
    except Exception:
        logger.exception("Matching failed")
        raise HTTPException(status_code=500, detail="Matching failed — please try again")