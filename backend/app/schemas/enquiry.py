from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class EnquiryCreate(BaseModel):
    property_id: str = Field(..., max_length=50)
    message: Optional[str] = Field(default=None, max_length=1000)


class EnquiryOut(BaseModel):
    id: str
    property_id: str
    message: Optional[str] = None
    status: str
    created_at: datetime


class AdminEnquiryOut(BaseModel):
    id: str
    property_id: str
    locality: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime
    user_code: Optional[str] = None
    full_name: Optional[str] = None
    email: str
    phone: Optional[str] = None


class EnquiryStatusUpdate(BaseModel):
    status: Literal["new", "contacted", "closed"]


class MyEnquiryStatus(BaseModel):
    has_open_enquiry: bool