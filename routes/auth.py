from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import schemas
import models

from fastapi.security import OAuth2PasswordRequestForm
from security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Mathematically hash the password before it ever touches the database
    hashed_password = get_password_hash(user.password)
    
    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password,  # SECURE!
        age=user.age,
        gender=user.gender,
        city=user.city,
        education=user.education,
        occupation=user.occupation
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return {"message": "User registered successfully", "user_id": db_user.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

from sqlalchemy import func

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Fetch user by email (case-insensitive and trimmed)
    email_lower = form_data.username.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == email_lower).first()
    
    # 2. Prevent hackers by verifying the hashed password
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    # 3. Generate the secure JWT token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,
        "kyc_status": user.kyc_status
    }
