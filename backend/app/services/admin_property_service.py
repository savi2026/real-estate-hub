from datetime import date
from sqlalchemy import text
from sqlalchemy.orm import Session

AREA_TOLERANCE = 0.05
PRICE_TOLERANCE = 0.05


def _next_admin_property_id(db: Session) -> str:
    row = db.execute(
        text("SELECT property_id FROM properties WHERE property_id LIKE 'NGP-ADM-%' ORDER BY property_id DESC LIMIT 1")
    ).first()
    if not row:
        return "NGP-ADM-000001"
    last_num = int(row[0].split("-")[-1])
    return f"NGP-ADM-{last_num + 1:06d}"


def find_potential_duplicates(db: Session, payload):
    query = text("""
        SELECT property_id, locality, sub_locality, area_sqft, asking_price_inr
        FROM properties
        WHERE status = 'active'
          AND locality ILIKE :locality
          AND land_type = :land_type
          AND area_sqft BETWEEN :area_min AND :area_max
          AND asking_price_inr BETWEEN :price_min AND :price_max
    """)
    rows = db.execute(query, {
        "locality": payload.locality,
        "land_type": payload.land_type,
        "area_min": payload.area_sqft * (1 - AREA_TOLERANCE),
        "area_max": payload.area_sqft * (1 + AREA_TOLERANCE),
        "price_min": payload.asking_price_inr * (1 - PRICE_TOLERANCE),
        "price_max": payload.asking_price_inr * (1 + PRICE_TOLERANCE),
    }).mappings().all()

    results = []
    for r in rows:
        d = dict(r)
        d["area_sqft"] = float(d["area_sqft"])
        d["asking_price_inr"] = float(d["asking_price_inr"])
        results.append(d)
    return results


def create_property(db: Session, payload, admin_id: str):
    duplicates = find_potential_duplicates(db, payload)
    if duplicates and not payload.force_add:
        return None, duplicates

    property_id = _next_admin_property_id(db)
    price_per_sqft = round(payload.asking_price_inr / payload.area_sqft, 2)

    db.execute(text("""
        INSERT INTO properties (
            property_id, city, locality, sub_locality, address, pincode,
            property_type, land_type, new_resale, area_sqft, plot_length_ft,
            plot_width_ft, asking_price_inr, price_per_sqft_inr, facing,
            main_road, ownership_type, fsi, nmrda_nit_approval, legal_status,
            listing_date, status, updated_at, updated_by
        ) VALUES (
            :property_id, 'Nagpur', :locality, :sub_locality, :address, :pincode,
            :property_type, :land_type, :new_resale, :area_sqft, :plot_length_ft,
            :plot_width_ft, :asking_price_inr, :price_per_sqft_inr, :facing,
            :main_road, :ownership_type, :fsi, :nmrda_nit_approval, :legal_status,
            :listing_date, 'active', now(), :admin_id
        )
    """), {
        "property_id": property_id,
        "locality": payload.locality,
        "sub_locality": payload.sub_locality,
        "address": payload.address,
        "pincode": payload.pincode,
        "property_type": payload.property_type,
        "land_type": payload.land_type,
        "new_resale": payload.new_resale,
        "area_sqft": payload.area_sqft,
        "plot_length_ft": payload.plot_length_ft,
        "plot_width_ft": payload.plot_width_ft,
        "asking_price_inr": payload.asking_price_inr,
        "price_per_sqft_inr": price_per_sqft,
        "facing": payload.facing,
        "main_road": payload.main_road,
        "ownership_type": payload.ownership_type,
        "fsi": payload.fsi,
        "nmrda_nit_approval": payload.nmrda_nit_approval,
        "legal_status": payload.legal_status,
        "listing_date": date.today(),
        "admin_id": admin_id,
    })
    db.commit()
    return property_id, []


def update_property(db: Session, property_id: str, payload, admin_id: str):
    fields = payload.model_dump(exclude_unset=True)
    if not fields:
        return False

    if "asking_price_inr" in fields or "area_sqft" in fields:
        current = db.execute(
            text("SELECT asking_price_inr, area_sqft FROM properties WHERE property_id = :id"),
            {"id": property_id},
        ).mappings().first()
        if current:
            price = fields.get("asking_price_inr", float(current["asking_price_inr"]))
            area = fields.get("area_sqft", float(current["area_sqft"]))
            if area > 0:
                fields["price_per_sqft_inr"] = round(price / area, 2)

    set_clause = ", ".join([f"{k} = :{k}" for k in fields.keys()])
    fields["property_id"] = property_id
    fields["admin_id"] = admin_id

    result = db.execute(
        text(f"UPDATE properties SET {set_clause}, updated_at = now(), updated_by = :admin_id WHERE property_id = :property_id"),
        fields,
    )
    db.commit()
    return result.rowcount > 0


def update_status(db: Session, property_id: str, status: str, admin_id: str):
    result = db.execute(
        text("UPDATE properties SET status = :status, updated_at = now(), updated_by = :admin_id WHERE property_id = :property_id"),
        {"status": status, "admin_id": admin_id, "property_id": property_id},
    )
    db.commit()
    return result.rowcount > 0

def get_status_counts(db: Session):
    rows = db.execute(text("SELECT status, count(*) as count FROM properties GROUP BY status")).mappings().all()
    counts = {"active": 0, "sold": 0, "withdrawn": 0}
    for r in rows:
        counts[r["status"]] = r["count"]
    counts["total"] = sum(counts.values())
    return counts

def delete_property(db: Session, property_id: str):
    result = db.execute(text("DELETE FROM properties WHERE property_id = :id"), {"id": property_id})
    db.commit()
    return result.rowcount > 0


def list_all_properties(
    db: Session, status_filter, page: int, page_size: int,
    property_type=None, land_type=None, locality=None,
    min_area=None, max_area=None, min_price=None, max_price=None,
):
    offset = (page - 1) * page_size
    params = {"limit": page_size, "offset": offset}
    conditions = []

    if status_filter:
        conditions.append("status = :status")
        params["status"] = status_filter
    if property_type:
        conditions.append("property_type = :property_type")
        params["property_type"] = property_type
    if land_type:
        conditions.append("land_type = :land_type")
        params["land_type"] = land_type
    if locality:
        conditions.append("locality ILIKE :locality")
        params["locality"] = f"%{locality}%"
    if min_area is not None:
        conditions.append("area_sqft >= :min_area")
        params["min_area"] = min_area
    if max_area is not None:
        conditions.append("area_sqft <= :max_area")
        params["max_area"] = max_area
    if min_price is not None:
        conditions.append("asking_price_inr >= :min_price")
        params["min_price"] = min_price
    if max_price is not None:
        conditions.append("asking_price_inr <= :max_price")
        params["max_price"] = max_price

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    rows = db.execute(text(f"""
        SELECT property_id, locality, sub_locality, property_type, land_type,
               area_sqft, asking_price_inr, price_per_sqft_inr, status, updated_at
        FROM properties {where}
        ORDER BY updated_at DESC NULLS LAST, property_id
        LIMIT :limit OFFSET :offset
    """), params).mappings().all()

    total = db.execute(text(f"SELECT COUNT(*) FROM properties {where}"), params).scalar()

    results = []
    for r in rows:
        d = dict(r)
        d["area_sqft"] = float(d["area_sqft"]) if d["area_sqft"] is not None else None
        d["asking_price_inr"] = float(d["asking_price_inr"]) if d["asking_price_inr"] is not None else None
        d["price_per_sqft_inr"] = float(d["price_per_sqft_inr"]) if d["price_per_sqft_inr"] is not None else None
        d["updated_at"] = d["updated_at"].isoformat() if d["updated_at"] else None
        results.append(d)

    return results, total