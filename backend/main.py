from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Listing, User
from schemas import ListingOut, LoginRequest, ReasonRequest, UserOut

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LU Student Housing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "LU Student Housing API is running"}


@app.post("/api/auth/login", response_model=UserOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.status == "inactive":
        raise HTTPException(status_code=403, detail="Account is inactive")

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
    return db.query(Listing).all()


@app.get("/api/listings/approved", response_model=list[ListingOut])
def get_approved_listings(db: Session = Depends(get_db)):
    return db.query(Listing).filter(Listing.status == "approved").all()


@app.get("/api/listings/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    return listing


@app.patch("/api/listings/{listing_id}/approve", response_model=ListingOut)
def approve_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

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