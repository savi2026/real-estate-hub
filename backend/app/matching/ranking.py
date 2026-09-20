def rank_candidates(scored: list[dict], max_results: int) -> list[dict]:
    for p in scored:
        if p.get("business_score") is not None:
            p["final_score"] = round(0.5 * p["match_score"] + 0.5 * p["business_score"])
        else:
            p["final_score"] = p["match_score"]

        if p["final_score"] >= 75:
            p["priority"] = "High"
        elif p["final_score"] >= 45:
            p["priority"] = "Medium"
        else:
            p["priority"] = "Low"

    ranked = sorted(scored, key=lambda p: (-p["final_score"], p["asking_price_inr"]))
    return ranked[:max_results]