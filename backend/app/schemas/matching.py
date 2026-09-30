from pydantic import BaseModel, Field, model_validator
from enum import Enum
from typing import Optional


class PropertyTypeEnum(str, Enum):
    residential = "Residential"
    commercial = "Commercial"
    agriculture = "Agriculture"


class LandTypeEnum(str, Enum):
    apartment = "Apartment"
    residential_plot = "Residential Plot"
    independent_house = "Independent House"
    agricultural_land = "Agricultural Land"
    villa = "Villa"
    shop = "Shop"
    builder_floor = "Builder Floor"
    office = "Office"
    commercial_plot = "Commercial Plot"
    farm_plot = "Farm Plot"
    warehouse = "Warehouse"


class MatchRequest(BaseModel):
    property_type: PropertyTypeEnum
    land_type: Optional[LandTypeEnum] = None

    min_area: Optional[float] = Field(default=None, ge=0, le=1_000_000)
    max_area: Optional[float] = Field(default=None, ge=0, le=1_000_000)

    max_budget: float = Field(..., gt=0, le=1_000_000_000)
    min_budget: Optional[float] = Field(default=None, ge=0, le=1_000_000_000)
    preferred_locality: Optional[str] = Field(default=None, max_length=100)
    strict_locality: bool = Field(default=True)

    max_results: int = Field(default=20, ge=1, le=50)

    target_selling_price_per_sqft: Optional[float] = Field(default=None, gt=0, le=1_000_000)
    construction_cost_per_sqft: float = Field(default=1800, gt=0, le=1_000_000)
    carpet_efficiency_percent: float = Field(default=70, gt=0, le=100)
    buffer_percent: float = Field(default=10, ge=0, le=100)

    @model_validator(mode="after")
    def check_area_range(self):
        if self.min_area is not None and self.max_area is not None:
            if self.min_area > self.max_area:
                raise ValueError("min_area cannot be greater than max_area")
                if self.min_budget is not None and self.min_budget > self.max_budget:
                    raise ValueError("min_budget cannot be greater than max_budget")
        return self


class MatchedProperty(BaseModel):
    property_id: str
    locality: Optional[str] = None
    sub_locality: Optional[str] = None
    property_type: Optional[str] = None
    land_type: Optional[str] = None
    area_sqft: Optional[float] = None
    asking_price_inr: Optional[float] = None
    price_per_sqft_inr: Optional[float] = None
    legal_status: Optional[str] = None
    fsi: Optional[float] = None
    facing: Optional[str] = None
    new_resale: Optional[str] = None

    match_score: int
    match_reasons: list[str]

    built_up_area_sqft: Optional[float] = None
    estimated_revenue_inr: Optional[float] = None
    estimated_cost_inr: Optional[float] = None
    estimated_profit_inr: Optional[float] = None
    profit_margin_percent: Optional[float] = None
    roi_on_land_percent: Optional[float] = None
    business_score: Optional[int] = None

    final_score: int
    priority: str


class MatchResponse(BaseModel):
    total_candidates: int
    returned: int
    results: list[MatchedProperty]