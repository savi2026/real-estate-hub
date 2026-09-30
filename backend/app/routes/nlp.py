import logging
from fastapi import APIRouter, HTTPException
from app.schemas.nlp import NLPParseRequest, NLPParseResponse
from app.services import nlp_service

router = APIRouter()
logger = logging.getLogger("nlp_route")


@router.post("/match/parse", response_model=NLPParseResponse)
def parse_requirement(req: NLPParseRequest):
    try:
        parsed = nlp_service.parse_requirement(req.query)
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        logger.exception("Unexpected error parsing requirement")
        raise HTTPException(status_code=500, detail="Something went wrong understanding your description.")

    notes = parsed.pop("_notes", [])
    found_fields = [k for k, v in parsed.items() if v]

    if not found_fields or "property_type" not in parsed:
        raise HTTPException(
            status_code=422,
            detail="Couldn't confidently extract enough details. Please mention property type, budget, and area explicitly.",
        )

    summary_parts = []
    if "property_type" in parsed:
        summary_parts.append(parsed["property_type"])
    if "land_type" in parsed:
        summary_parts.append(f"({parsed['land_type']})")
    if "min_area" in parsed or "max_area" in parsed:
        summary_parts.append(f"{parsed.get('min_area', '?')}-{parsed.get('max_area', '?')} sq.ft")
    if "max_budget" in parsed:
        summary_parts.append(f"up to ₹{int(parsed['max_budget']):,}")
    if "preferred_locality" in parsed:
        summary_parts.append(f"near {parsed['preferred_locality']}")

    return NLPParseResponse(
        understood=True,
        parsed_fields=parsed,
        summary=" · ".join(summary_parts),
        unrecognized_notes=notes,
    )