import logging
import requests
from fastapi import APIRouter, HTTPException, Query
from app.config import settings

router = APIRouter()
logger = logging.getLogger("images")

_cache: dict[str, list[dict]] = {}

CATEGORY_QUERIES = {
    "Apartment": "modern apartment building exterior",
    "Residential Plot": "vacant land plot real estate",
    "Independent House": "independent house exterior India",
    "Villa": "luxury villa exterior",
    "Builder Floor": "modern apartment building exterior",
    "Shop": "retail shop storefront",
    "Office": "modern office building exterior",
    "Commercial Plot": "commercial land plot",
    "Warehouse": "warehouse exterior industrial",
    "Agricultural Land": "agricultural farmland aerial",
    "Farm Plot": "farm land field",
    "Residential": "residential neighborhood India",
    "Commercial": "commercial building exterior",
    "Agriculture": "agricultural farmland",
    "hero": "modern luxury home exterior dusk architecture",
    "hero_home": "glass skyscraper low angle architecture",
}


def _fetch_pool(category: str) -> list[dict]:
    if category in _cache:
        return _cache[category]

    if not settings.PEXELS_API_KEY:
        raise HTTPException(status_code=503, detail="Image service not configured")

    query = CATEGORY_QUERIES.get(category, "real estate property")

    try:
        res = requests.get(
            "https://api.pexels.com/v1/search",
            headers={"Authorization": settings.PEXELS_API_KEY},
            params={"query": query, "per_page": 10, "orientation": "landscape"},
            timeout=6,
        )
        res.raise_for_status()
        data = res.json()
        photos = data.get("photos", [])
        if not photos:
            raise HTTPException(status_code=404, detail="No image found")

        pool = [
            {"url": p["src"]["large"], "photographer": p["photographer"], "photographer_url": p["photographer_url"]}
            for p in photos
        ]
        _cache[category] = pool
        return pool
    except requests.RequestException:
        logger.exception("Pexels request failed for category %s", category)
        raise HTTPException(status_code=503, detail="Image service unavailable")


@router.get("/images/category")
def get_category_image(category: str = Query(...), seed: str = Query(default="")):
    pool = _fetch_pool(category)

    if not seed:
        return pool[0]

    index = sum(ord(c) for c in seed) % len(pool)
    return pool[index]