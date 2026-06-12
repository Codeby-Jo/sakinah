from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(tags=["profile"])

from security import get_current_user

@router.post("/profile")
def update_profile(req: schemas.ProfileSetupRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update user basic info
    current_user.full_name = f"{req.firstName} {req.lastName}"
    current_user.gender = req.gender
    current_user.city = req.location
    current_user.education = req.education
    current_user.occupation = req.occupation
    
    # Normally we would save religion, tradition, etc. to models.ReligiousDetails and models.PsychologicalProfile
    # For now we'll just save it to User / PsychologicalProfile if exists
    if not current_user.psychological_profile:
        current_user.psychological_profile = models.PsychologicalProfile(user_id=current_user.id)
    
    current_user.psychological_profile.marriage_readiness = req.marriage_readiness
    
    db.add(current_user)
    db.commit()
    return {"message": "Profile updated successfully"}

@router.get("/profile/{id}", response_model=schemas.UserResponse)
def profile(id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
