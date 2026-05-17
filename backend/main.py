import os
import uuid
from contextlib import asynccontextmanager
from datetime import date
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Listing, User
from schemas import (
    ListingOut,
    LoginRequest,
    ReasonRequest,
    RegisterRequest,
    UpdateProfileRequest,
    UserOut,
)

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    with engine.connect() as conn:
        for sql in [
            "ALTER TABLE users ADD COLUMN password TEXT",
            "ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''",
            "ALTER TABLE listings ADD COLUMN photos TEXT DEFAULT ''",
            "ALTER TABLE listings ADD COLUMN date_posted TEXT DEFAULT ''",
            "ALTER TABLE listings ADD COLUMN inquiries INTEGER DEFAULT 0",
            "ALTER TABLE listings ADD COLUMN is_available INTEGER DEFAULT 1",
        ]:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass
    yield


app = FastAPI(title="LU Student Housing API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def home():
    return {"message": "LU Student Housing API is running"}


@app.post("/api/auth/register", response_model=UserOut)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()

    if "admin" in email:
        raise HTTPException(
            status_code=400,
            detail="Admin accounts cannot be self-registered.",
        )

    if "student" in email:
        role = "student"
    elif "landlord" in email:
        role = "landlord"
    else:
        raise HTTPException(
            status_code=400,
            detail="Email must contain 'student' or 'landlord'.",
        )

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    user = User(
        name=data.name.strip(),
        email=email,
        password=pwd_context.hash(data.password),
        phone=data.phone.strip() if getattr(data, "phone", None) else "",
        role=role,
        status="active",
        join_date=date.today().strftime("%Y-%m-%d"),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=UserOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if user.status == "inactive":
        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated. Please contact admin.",
        )

    if not user.password:
        # Allows old seeded demo users to login with any password
        return user

    if not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return user


@app.patch("/api/users/{user_id}/profile", response_model=UserOut)
def update_profile(
    user_id: int,
    data: UpdateProfileRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty.")

    user.name = data.name.strip()
    user.phone = data.phone.strip() if data.phone else ""

    db.commit()
    db.refresh(user)
    return user


@app.get("/api/users", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@app.patch("/api/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot deactivate admin")

    user.status = "inactive"
    db.commit()
    db.refresh(user)
    return user


@app.patch("/api/users/{user_id}/reactivate", response_model=UserOut)
def reactivate_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = "active"
    db.commit()
    db.refresh(user)
    return user


@app.get("/api/listings", response_model=list[ListingOut])
def get_listings(db: Session = Depends(get_db)):
    return db.query(Listing).filter(Listing.status != "deleted").all()


@app.get("/api/listings/approved", response_model=list[ListingOut])
def get_approved_listings(db: Session = Depends(get_db)):
    return (
        db.query(Listing)
        .filter(Listing.status == "approved", Listing.is_available == True)
        .all()
    )


@app.get("/api/listings/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    return listing


@app.post("/api/listings", response_model=ListingOut)
async def create_listing(
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    price: float = Form(...),
    beds: int = Form(...),
    available: str = Form(...),
    type: str = Form("Shared"),
    baths: int = Form(1),
    sqm: int = Form(0),
    distance: str = Form(""),
    amenities: str = Form(""),
    landlord_name: str = Form(...),
    landlord_email: str = Form(...),
    landlord_phone: str = Form(...),
    photos: Optional[List[UploadFile]] = File(default=None),
    db: Session = Depends(get_db),
):
    photo_names = []

    for photo in (photos or [])[:5]:
        if photo.filename:
            ext = os.path.splitext(photo.filename)[1].lower()
            if ext in ALLOWED_EXTENSIONS:
                filename = f"{uuid.uuid4().hex}{ext}"
                content = await photo.read()
                with open(os.path.join(UPLOAD_DIR, filename), "wb") as file:
                    file.write(content)
                photo_names.append(filename)

    listing = Listing(
        title=title,
        type=type,
        price=price,
        location=location,
        distance=distance,
        beds=beds,
        baths=baths,
        sqm=sqm,
        available=available,
        amenities=amenities,
        description=description,
        rating=0.0,
        reviews=0,
        color="#1b4332",
        landlord_name=landlord_name,
        landlord_email=landlord_email,
        landlord_phone=landlord_phone,
        photos=",".join(photo_names),
        date_posted=date.today().isoformat(),
        inquiries=0,
        is_available=True,
        status="pending",
        admin_reason="",
        last_admin_action="",
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@app.patch("/api/listings/{listing_id}", response_model=ListingOut)
async def update_listing(
    listing_id: int,
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    price: float = Form(...),
    beds: int = Form(...),
    available: str = Form(...),
    type: str = Form("Shared"),
    baths: int = Form(1),
    sqm: int = Form(0),
    distance: str = Form(""),
    amenities: str = Form(""),
    landlord_phone: str = Form(...),
    existing_photos: str = Form(""),
    new_photos: Optional[List[UploadFile]] = File(default=None),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    price_changed = abs(listing.price - price) > 0.001

    kept_photos = [item.strip() for item in existing_photos.split(",") if item.strip()]

    for photo in new_photos or []:
        if photo.filename and len(kept_photos) < 5:
            ext = os.path.splitext(photo.filename)[1].lower()
            if ext in ALLOWED_EXTENSIONS:
                filename = f"{uuid.uuid4().hex}{ext}"
                content = await photo.read()
                with open(os.path.join(UPLOAD_DIR, filename), "wb") as file:
                    file.write(content)
                kept_photos.append(filename)

    listing.title = title
    listing.type = type
    listing.price = price
    listing.location = location
    listing.distance = distance
    listing.beds = beds
    listing.baths = baths
    listing.sqm = sqm
    listing.available = available
    listing.amenities = amenities
    listing.description = description
    listing.landlord_phone = landlord_phone
    listing.photos = ",".join(kept_photos[:5])

    if price_changed and listing.status == "approved":
        listing.status = "pending"
        listing.last_admin_action = ""
        listing.admin_reason = ""

    db.commit()
    db.refresh(listing)
    return listing


@app.patch("/api/listings/{listing_id}/toggle-availability", response_model=ListingOut)
def toggle_availability(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.is_available = not listing.is_available

    db.commit()
    db.refresh(listing)
    return listing


@app.patch("/api/listings/{listing_id}/soft-delete", response_model=ListingOut)
def soft_delete_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = "deleted"

    db.commit()
    db.refresh(listing)
    return listing


@app.patch("/api/listings/{listing_id}/approve", response_model=ListingOut)
def approve_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.status == "approved":
        raise HTTPException(status_code=400, detail="This listing is already approved.")

    listing.status = "approved"
    listing.admin_reason = "Listing approved by admin."
    listing.last_admin_action = "approved"

    db.commit()
    db.refresh(listing)
    return listing


@app.patch("/api/listings/{listing_id}/reject", response_model=ListingOut)
def reject_listing(
    listing_id: int,
    data: ReasonRequest,
    db: Session = Depends(get_db),
):
    if not data.reason.strip():
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.status == "rejected":
        raise HTTPException(status_code=400, detail="This listing is already rejected.")

    listing.status = "rejected"
    listing.admin_reason = data.reason
    listing.last_admin_action = "rejected"

    db.commit()
    db.refresh(listing)
    return listing


@app.delete("/api/listings/{listing_id}")
def remove_listing(
    listing_id: int,
    data: ReasonRequest,
    db: Session = Depends(get_db),
):
    if not data.reason.strip():
        raise HTTPException(status_code=400, detail="Removal reason is required")

    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    removed_title = listing.title

    db.delete(listing)
    db.commit()

    return {
        "message": "Listing removed successfully",
        "listing": removed_title,
        "reason": data.reason,
    }