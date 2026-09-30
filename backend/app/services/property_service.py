from sqlalchemy import text
from sqlalchemy.orm import Session
from app.schemas.property import PropertySearchRequest

LIST_COLUMNS = """
    property_id, locality, property_type, land_type,
    area_sqft, asking_price_inr, price_per_sqft_inr
"""

DETAIL_COLUMNS = """
    property_id, city, locality, sub_locality, address, pincode,
    property_type, land_type, new_resale, area_sqft, plot_length_ft,
    plot_width_ft, asking_price_inr, price_per_sqft_inr, facing,
    main_road, ownership_type, fsi, nmrda_nit_approval, legal_status,
    listing_date
"""


def get_property_by_id(db: Session, property_id: str):
    query = text(f"SELECT {DETAIL_COLUMNS} FROM properties WHERE property_id = :pid AND status = 'active'")
    row = db.execute(query, {"pid": property_id}).mappings().first()
    return dict(row) if row else None


def list_properties(db: Session, page: int = 1, page_size: int = 20):
    offset = (page - 1) * page_size
    rows = db.execute(
        text(f"SELECT {LIST_COLUMNS} FROM properties WHERE status = 'active' ORDER BY property_id LIMIT :limit OFFSET :offset"),
        {"limit": page_size, "offset": offset},
    ).mappings().all()
    total = db.execute(text("SELECT COUNT(*) FROM properties WHERE status = 'active'")).scalar()
    return [dict(r) for r in rows], total


def search_properties(db: Session, filters: PropertySearchRequest):
    conditions = ["status = 'active'"]
    params = {}

    if filters.property_type:
        conditions.append("property_type = :property_type")
        params["property_type"] = filters.property_type

    if filters.land_type:
        conditions.append("land_type = :land_type")
        params["land_type"] = filters.land_type

    if filters.locality:
        conditions.append("locality ILIKE :locality")
        params["locality"] = f"%{filters.locality}%"

    if filters.min_area is not None:
        conditions.append("area_sqft >= :min_area")
        params["min_area"] = filters.min_area

    if filters.max_area is not None:
        conditions.append("area_sqft <= :max_area")
        params["max_area"] = filters.max_area

    if filters.min_price is not None:
        conditions.append("asking_price_inr >= :min_price")
        params["min_price"] = filters.min_price

    if filters.max_price is not None:
        conditions.append("asking_price_inr <= :max_price")
        params["max_price"] = filters.max_price

    where_clause = f"WHERE {' AND '.join(conditions)}"
    offset = (filters.page - 1) * filters.page_size

    total = db.execute(text(f"SELECT COUNT(*) FROM properties {where_clause}"), params).scalar()

    data_query = text(
        f"SELECT {LIST_COLUMNS} FROM properties {where_clause} "
        f"ORDER BY property_id LIMIT :limit OFFSET :offset"
    )
    params["limit"] = filters.page_size
    params["offset"] = offset

    rows = db.execute(data_query, params).mappings().all()
    return [dict(r) for r in rows], total