from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date


class PropertyOut(BaseModel):
    """Full property record returned to the frontend."""
    model_config = ConfigDict(from_attributes=True)

    property_id: str
    city: Optional[str] = None
    locality: Optional[str] = None
    sub_locality: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[int] = None
    property_type: Optional[str] = None
    land_type: Optional[str] = None
    new_resale: Optional[str] = None
    area_sqft: Optional[float] = None
    plot_length_ft: Optional[float] = None
    plot_width_ft: Optional[float] = None
    asking_price_inr: Optional[float] = None
    price_per_sqft_inr: Optional[float] = None
    facing: Optional[str] = None
    main_road: Optional[str] = None
    ownership_type: Optional[str] = None
    fsi: Optional[float] = None
    nmrda_nit_approval: Optional[str] = None
    legal_status: Optional[str] = None
    listing_date: Optional[date] = None


class PropertyListItem(BaseModel):
    """Lighter version for list/search results — avoids over-fetching."""
    model_config = ConfigDict(from_attributes=True)

    property_id: str
    locality: Optional[str] = None
    property_type: Optional[str] = None
    land_type: Optional[str] = None
    area_sqft: Optional[float] = None
    asking_price_inr: Optional[float] = None
    price_per_sqft_inr: Optional[float] = None


class PropertySearchRequest(BaseModel):
    """Validated search filters. Hard limits prevent abuse."""
    property_type: Optional[str] = None
    land_type: Optional[str] = None
    locality: Optional[str] = None
    min_area: Optional[float] = Field(default=None, ge=0, le=1_000_000)
    max_area: Optional[float] = Field(default=None, ge=0, le=1_000_000)
    min_price: Optional[float] = Field(default=None, ge=0, le=1_000_000_000)
    max_price: Optional[float] = Field(default=None, ge=0, le=1_000_000_000)
    page: int = Field(default=1, ge=1, le=1000)
    page_size: int = Field(default=20, ge=1, le=100)


class PropertySearchResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[PropertyListItem]