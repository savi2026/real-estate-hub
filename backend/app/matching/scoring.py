from app.schemas.matching import MatchRequest

# Legal status risk ranking — based on actual distinct values in the database
LEGAL_STATUS_SCORE = {
    "Clear Title": 20,
    "Registry Ready": 18,
    "Bank Loan Eligible": 16,
    "Documentation Pending": 8,
    "Title Verification Pending": 4,
    "Dispute Check Required": 0,
}


def score_budget(price: float, max_budget: float) -> float:
    """Rewards using more of the available budget. Max 30 pts."""
    if max_budget <= 0:
        return 0
    ratio = min(max(price / max_budget, 0), 1)
    return round(30 * ratio, 2)


def score_area(area: float, min_area, max_area) -> float:
    """Rewards area near the midpoint of the requested range. Max 30 pts."""
    if min_area is None and max_area is None:
        return 30.0  # no preference stated — neutral, full points

    if min_area is not None and max_area is not None:
        midpoint = (min_area + max_area) / 2
        half_range = max((max_area - min_area) / 2, 1)
        distance = abs(area - midpoint)
        score = 30 * max(0, 1 - (distance / (half_range * 2)))
        return round(score, 2)

    # only one bound given — reward proximity to it
    target = min_area if min_area is not None else max_area
    distance_ratio = abs(area - target) / max(target, 1)
    return round(30 * max(0, 1 - distance_ratio), 2)


def score_locality(locality: str, sub_locality: str, preferred: str) -> float:
    """Rewards matching the broker's stated locality preference. Max 20 pts."""
    if not preferred:
        return 20.0  # no preference stated — neutral, full points

    preferred_lower = preferred.strip().lower()
    if locality and preferred_lower == locality.strip().lower():
        return 20.0
    if sub_locality and preferred_lower in sub_locality.strip().lower():
        return 12.0
    if locality and preferred_lower in locality.strip().lower():
        return 12.0
    return 0.0


def score_legal(legal_status: str) -> float:
    """Rewards lower legal risk. Max 20 pts."""
    return float(LEGAL_STATUS_SCORE.get(legal_status, 8))


def score_property(candidate: dict, req: MatchRequest) -> tuple[int, list[str]]:
    """Returns (match_score 0-100, match_reasons)."""
    reasons = [f"Matches required property type: {req.property_type.value}"]
    if req.land_type:
        reasons.append(f"Matches required land type: {req.land_type.value}")

    budget_pts = score_budget(candidate["asking_price_inr"], req.max_budget)
    reasons.append(f"Within your maximum budget of ₹{int(req.max_budget):,}")

    area_pts = score_area(candidate["area_sqft"], req.min_area, req.max_area)
    if req.min_area or req.max_area:
        if area_pts >= 20:
            reasons.append("Area closely matches your requested range")
        elif area_pts > 0:
            reasons.append("Area is reasonably close to your requested range")

    locality_pts = score_locality(candidate["locality"], candidate["sub_locality"], req.preferred_locality)
    if req.preferred_locality and locality_pts >= 12:
        reasons.append(f"Located in or near your preferred locality: {req.preferred_locality}")

    legal_pts = score_legal(candidate["legal_status"])
    if legal_pts >= 16:
        reasons.append(f"Low legal risk ({candidate['legal_status']})")
    elif legal_pts <= 4:
        reasons.append(f"Caution: legal status is '{candidate['legal_status']}'")

    total = round(budget_pts + area_pts + locality_pts + legal_pts)
    return total, reasons