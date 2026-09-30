import json
import logging
import re
import requests
from app.config import settings
from app.schemas.matching import PropertyTypeEnum, LandTypeEnum

logger = logging.getLogger("nlp")

VALID_PROPERTY_TYPES = [e.value for e in PropertyTypeEnum]
VALID_LAND_TYPES = [e.value for e in LandTypeEnum]

SYSTEM_PROMPT = f"""You extract structured real-estate search parameters from a broker's plain-English description of what their client needs.

Return ONLY a single valid JSON object, no other text, no markdown fences. The JSON may include ONLY these keys, and ONLY when you are confident the text actually states or clearly implies them:

- property_type: one of {VALID_PROPERTY_TYPES}
- land_type: one of {VALID_LAND_TYPES}
- min_area: number (square feet)
- max_area: number (square feet)
- min_budget: number (INR, convert "crore"/"Cr" to 10000000x, "lakh"/"L" to 100000x)
- max_budget: number (INR, same conversion)
- preferred_locality: string, only if a specific Nagpur locality/area name is mentioned
- target_selling_price_per_sqft: number (INR), ONLY if the user gives an explicit numeric selling/rental price per sqft. Do NOT estimate or guess this from vague terms like "affordable" or "mid-range" — omit it entirely if no number is given.

IMPORTANT REASONING RULE: if the user wants to BUY LAND to CONSTRUCT something (e.g. "build apartments", "construct a warehouse"), the land_type must be the vacant-land type they need to buy (e.g. "Residential Plot", "Commercial Plot", "Agricultural Land"), NOT the finished building type (e.g. never "Apartment" for someone who wants to build apartments — they need to buy a Residential Plot to build on).

Omit any field you cannot confidently determine. Never fabricate a number that wasn't stated or clearly implied. Return valid JSON only.

Text: """


CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-1.5-flash"]


def parse_requirement(query: str) -> dict:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("AI parsing is not configured on this server yet.")

    body = {"contents": [{"parts": [{"text": SYSTEM_PROMPT + query}]}]}
    raw_text = None
    last_error = None

    for model in CANDIDATE_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
        try:
            res = requests.post(url, json=body, timeout=15)
            if res.status_code == 404:
                last_error = f"{model}: 404 not found"
                continue
            res.raise_for_status()
            data = res.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            break
        except (requests.RequestException, KeyError, IndexError) as e:
            last_error = f"{model}: {e}"
            continue

    if raw_text is None:
        logger.error("All Gemini model attempts failed. Last error: %s", last_error)
        raise RuntimeError("AI parsing service is unavailable right now.")

    # Strip markdown fences if the model added them despite instructions
    cleaned = re.sub(r"^```(json)?|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Gemini returned non-JSON: %s", raw_text)
        raise RuntimeError("Couldn't understand that description. Try rephrasing with specific numbers for area and budget.")

    return sanitize_parsed_fields(parsed)


def sanitize_parsed_fields(parsed: dict) -> dict:
    """Deterministic validation layer — never trust the AI's output blindly."""
    clean = {}
    notes = []

    if parsed.get("property_type") in VALID_PROPERTY_TYPES:
        clean["property_type"] = parsed["property_type"]
    elif "property_type" in parsed:
        notes.append("Couldn't determine a valid property type — please select one manually.")

    if parsed.get("land_type") in VALID_LAND_TYPES:
        clean["land_type"] = parsed["land_type"]

    for key in ["min_area", "max_area", "min_budget", "max_budget", "target_selling_price_per_sqft"]:
        val = parsed.get(key)
        if isinstance(val, (int, float)) and val > 0:
            clean[key] = val

    if isinstance(parsed.get("preferred_locality"), str) and parsed["preferred_locality"].strip():
        clean["preferred_locality"] = parsed["preferred_locality"].strip()

    clean["_notes"] = notes
    return clean