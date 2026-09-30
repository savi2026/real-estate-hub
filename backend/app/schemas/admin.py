from pydantic import BaseModel, Field
from typing import Optional, Literal


class PropertyCreate(BaseModel):
    locality: str = Field(..., max_length=100)
    sub_locality: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=300)
    pincode: Optional[int] = Field(default=None, ge=100000, le=999999)
    property_type: str
    land_type: str
    new_resale: Optional[str] = Field(default="New", max_length=20)
    area_sqft: float = Field(..., gt=0, le=1_000_000)
    plot_length_ft: Optional[float] = Field(default=None, gt=0, le=10_000)
    plot_width_ft: Optional[float] = Field(default=None, gt=0, le=10_000)
    asking_price_inr: float = Field(..., gt=0, le=1_000_000_000)
    facing: Optional[str] = Field(default=None, max_length=20)
    main_road: Optional[str] = Field(default=None, max_length=20)
    ownership_type: Optional[str] = Field(default=None, max_length=50)
    fsi: Optional[float] = Field(default=None, gt=0, le=10)
    nmrda_nit_approval: Optional[str] = Field(default=None, max_length=50)
    legal_status: Optional[str] = Field(default="Documentation Pending", max_length=50)
    force_add: bool = Field(default=False)


class PropertyUpdate(BaseModel):
    locality: Optional[str] = Field(default=None, max_length=100)
    sub_locality: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=300)
    pincode: Optional[int] = Field(default=None, ge=100000, le=999999)
    property_type: Optional[str] = None
    land_type: Optional[str] = None
    new_resale: Optional[str] = Field(default=None, max_length=20)
    area_sqft: Optional[float] = Field(default=None, gt=0, le=1_000_000)
    plot_length_ft: Optional[float] = Field(default=None, gt=0, le=10_000)
    plot_width_ft: Optional[float] = Field(default=None, gt=0, le=10_000)
    asking_price_inr: Optional[float] = Field(default=None, gt=0, le=1_000_000_000)
    facing: Optional[str] = Field(default=None, max_length=20)
    main_road: Optional[str] = Field(default=None, max_length=20)
    ownership_type: Optional[str] = Field(default=None, max_length=50)
    fsi: Optional[float] = Field(default=None, gt=0, le=10)
    nmrda_nit_approval: Optional[str] = Field(default=None, max_length=50)
    legal_status: Optional[str] = Field(default=None, max_length=50)


class StatusUpdate(BaseModel):
    status: Literal["active", "sold", "withdrawn"]


class DuplicateMatch(BaseModel):
    property_id: str
    locality: str
    sub_locality: Optional[str] = None
    area_sqft: float
    asking_price_inr: float


class PropertyCreateResponse(BaseModel):
    property_id: Optional[str] = None
    created: bool
    potential_duplicates: list[DuplicateMatch] = []
    message: str


class AdminPropertyOut(BaseModel):
    property_id: str
    locality: Optional[str] = None
    sub_locality: Optional[str] = None
    property_type: Optional[str] = None
    land_type: Optional[str] = None
    area_sqft: Optional[float] = None
    asking_price_inr: Optional[float] = None
    price_per_sqft_inr: Optional[float] = None
    status: str
    updated_at: Optional[str] = None


class AdminPropertyListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[AdminPropertyOut]


class UserProfileOut(BaseModel):
    id: str
    user_code: Optional[str] = None
    email: str
    role: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    profession: Optional[str] = None
    address: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=100)
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[str] = Field(default=None, max_length=30)
    phone: Optional[str] = Field(default=None, max_length=20)
    profession: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=300)


class MessageResponse(BaseModel):
    message: str

class DashboardSummary(BaseModel):
    total_properties: int
    active_properties: int
    sold_properties: int
    withdrawn_properties: int
    total_users: int
    admin_users: int

class PromoteByEmailRequest(BaseModel):
    email: str = Field(..., max_length=200)