from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    name: str
    email: str
    role: str
    status: str
    join_date: str


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


class ListingBase(BaseModel):
    title: str
    type: str
    price: float
    location: str
    distance: str
    beds: int
    baths: int
    sqm: int
    available: str
    amenities: str
    description: str
    rating: float
    reviews: int
    color: str
    landlord_name: str
    landlord_email: str
    landlord_phone: str
    status: str
    admin_reason: str
    last_admin_action: str
    photos: Optional[str] = ""
    date_posted: Optional[str] = ""
    inquiries: int = 0
    is_available: bool = True


class ListingOut(ListingBase):
    id: int

    class Config:
        from_attributes = True


class ReasonRequest(BaseModel):
    reason: str


class LoginRequest(BaseModel):
    email: str