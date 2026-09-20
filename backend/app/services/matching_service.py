from sqlalchemy.orm import Session
from app.schemas.matching import MatchRequest
from app.matching import filters, scoring, ranking, feasibility


def run_match(db: Session, req: MatchRequest):
    candidates = filters.get_candidates(db, req)

    scored = []
    for c in candidates:
        score, reasons = scoring.score_property(c, req)
        feas = feasibility.compute_feasibility(c, req)
        scored.append({**c, "match_score": score, "match_reasons": reasons, **feas})

    ranked = ranking.rank_candidates(scored, req.max_results)
    return len(candidates), ranked