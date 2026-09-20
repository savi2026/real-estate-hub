def compute_feasibility(candidate: dict, req) -> dict:
    empty = {
        "built_up_area_sqft": None, "estimated_revenue_inr": None,
        "estimated_cost_inr": None, "estimated_profit_inr": None,
        "profit_margin_percent": None, "roi_on_land_percent": None,
        "business_score": None,
    }

    if req.target_selling_price_per_sqft is None or not candidate.get("fsi"):
        return empty

    built_up_area = candidate["area_sqft"] * candidate["fsi"]
    sellable_area = built_up_area * (req.carpet_efficiency_percent / 100)

    revenue = sellable_area * req.target_selling_price_per_sqft
    construction_cost = built_up_area * req.construction_cost_per_sqft
    base_cost = candidate["asking_price_inr"] + construction_cost
    total_cost = base_cost * (1 + req.buffer_percent / 100)

    profit = revenue - total_cost
    margin_pct = (profit / revenue * 100) if revenue > 0 else 0
    roi_pct = (profit / candidate["asking_price_inr"] * 100) if candidate["asking_price_inr"] > 0 else 0

    business_score = round(min(100, max(0, margin_pct * 2)))

    return {
        "built_up_area_sqft": round(built_up_area, 2),
        "estimated_revenue_inr": round(revenue, 2),
        "estimated_cost_inr": round(total_cost, 2),
        "estimated_profit_inr": round(profit, 2),
        "profit_margin_percent": round(margin_pct, 2),
        "roi_on_land_percent": round(roi_pct, 2),
        "business_score": business_score,
    }