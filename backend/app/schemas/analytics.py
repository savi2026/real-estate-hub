from pydantic import BaseModel
from typing import Optional


class LocalityAnalytics(BaseModel):
    locality: str
    total_properties: int
    avg_area_sqft: Optional[float] = None
    avg_price: Optional[float] = None
    avg_price_per_sqft: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    opportunity_score: Optional[float] = None


class PropertyTypeAnalytics(BaseModel):
    property_type: str
    total_properties: int
    avg_area_sqft: Optional[float] = None
    avg_price: Optional[float] = None
    avg_price_per_sqft: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None