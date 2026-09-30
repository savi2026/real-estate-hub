from pydantic import BaseModel, Field


class NLPParseRequest(BaseModel):
    query: str = Field(..., min_length=5, max_length=1000)


class NLPParseResponse(BaseModel):
    understood: bool
    parsed_fields: dict
    summary: str
    unrecognized_notes: list[str] = []