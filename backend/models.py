from sqlalchemy import Boolean, Column, Integer, String, Float, Text

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="active")
    join_date = Column(String, nullable=False)


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    distance = Column(String, nullable=False)
    beds = Column(Integer, nullable=False)
    baths = Column(Integer, nullable=False)
    sqm = Column(Integer, nullable=False)
    available = Column(String, nullable=False)
    amenities = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    rating = Column(Float, default=0)
    reviews = Column(Integer, default=0)
    color = Column(String, default="#1b4332")

    landlord_name = Column(String, nullable=False)
    landlord_email = Column(String, nullable=False)
    landlord_phone = Column(String, nullable=False)

    status = Column(String, default="pending")
    admin_reason = Column(Text, default="")
    last_admin_action = Column(String, default="")
    photos = Column(Text, default="")
    date_posted = Column(String, default="")
    inquiries = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)