from pydantic import BaseModel


class SavedPropertyOut(BaseModel):
    property_id: str


class SavedToggleResponse(BaseModel):
    saved: bool