from sqlalchemy import text
from sqlalchemy.orm import Session


def _to_float(v):
    return float(v) if v is not None else None


def get_locality_analytics(db: Session):
    query = text("""
        SELECT
            m.locality, m.total_properties, m.avg_area_sqft, m.avg_price,
            m.avg_price_per_sqft, m.min_price, m.max_price,
            o.opportunity_score
        FROM locality_market_analysis m
        LEFT JOIN locality_opportunity_score o ON o.locality = m.locality
        ORDER BY m.locality
    """)
    rows = db.execute(query).mappings().all()

    results = []
    for r in rows:
        d = dict(r)
        for key in ["avg_area_sqft", "avg_price", "avg_price_per_sqft", "min_price", "max_price", "opportunity_score"]:
            d[key] = _to_float(d[key])
        results.append(d)
    return results


def get_property_type_analytics(db: Session):
    query = text("SELECT * FROM property_type_analysis ORDER BY total_properties DESC")
    rows = db.execute(query).mappings().all()

    results = []
    for r in rows:
        d = dict(r)
        for key in ["avg_area_sqft", "avg_price", "avg_price_per_sqft", "min_price", "max_price"]:
            d[key] = _to_float(d[key])
        results.append(d)
    return results

def get_listing_trend(db: Session):
    rows = db.execute(text("""
        SELECT to_char(date_trunc('month', listing_date), 'Mon YYYY') as month,
               date_trunc('month', listing_date) as month_sort,
               count(*) as count
        FROM properties
        WHERE listing_date IS NOT NULL
        GROUP BY date_trunc('month', listing_date)
        ORDER BY month_sort
    """)).mappings().all()
    return [{"month": r["month"], "count": r["count"]} for r in rows]

def get_new_resale_split(db: Session):
    rows = db.execute(text("""
        SELECT new_resale, count(*) as count FROM properties
        WHERE status = 'active' AND new_resale IS NOT NULL
        GROUP BY new_resale
    """)).mappings().all()
    return [{"label": r["new_resale"], "count": r["count"]} for r in rows]