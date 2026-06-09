from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import schemas
import models

router = APIRouter()

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=user.password,  # Storing in plain text initially as requested
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
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

@router.post("/login")
def login(user: schemas.UserLogin):
    return {"message": "Login successful"}
