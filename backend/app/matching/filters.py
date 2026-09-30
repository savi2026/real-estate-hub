from sqlalchemy import text
from sqlalchemy.orm import Session
from app.schemas.matching import MatchRequest

CANDIDATE_COLUMNS = """
    property_id, locality, sub_locality, property_type, land_type,
    area_sqft, asking_price_inr, price_per_sqft_inr, legal_status, fsi,
    facing, new_resale
"""


def get_candidates(db: Session, req: MatchRequest):
    conditions = ["status = 'active'", "property_type = :property_type", "asking_price_inr <= :max_budget"]
    params = {
        "property_type": req.property_type.value,
        "max_budget": req.max_budget,
    }
    if req.min_budget is not None:
        conditions.append("asking_price_inr >= :min_budget")
        params["min_budget"] = req.min_budget

    if req.land_type:
        conditions.append("land_type = :land_type")
        params["land_type"] = req.land_type.value

    if req.min_area is not None:
        conditions.append("area_sqft >= :min_area")
        params["min_area"] = req.min_area

    if req.preferred_locality and req.strict_locality:
        conditions.append("(locality ILIKE :locality OR sub_locality ILIKE :locality)")
        params["locality"] = f"%{req.preferred_locality}%"

    where_clause = " AND ".join(conditions)

    query = text(f"SELECT {CANDIDATE_COLUMNS} FROM properties WHERE {where_clause}")
    rows = db.execute(query, params).mappings().all()

    candidates = []
    for r in rows:
        c = dict(r)
        c["area_sqft"] = float(c["area_sqft"]) if c["area_sqft"] is not None else None
        c["asking_price_inr"] = float(c["asking_price_inr"]) if c["asking_price_inr"] is not None else None
        c["price_per_sqft_inr"] = float(c["price_per_sqft_inr"]) if c["price_per_sqft_inr"] is not None else None
        c["fsi"] = float(c["fsi"]) if c["fsi"] is not None else None
        candidates.append(c)

    return candidates