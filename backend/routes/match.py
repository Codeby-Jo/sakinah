from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Preferences

# Importing from the newly pulled NIS engine in the backend folder
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.adapters.db_to_nis_mapper import (
    map_db_user_to_user_profile, 
    map_db_candidate_to_candidate_profile, 
    map_db_preference_to_match_preference
)

router = APIRouter()

@router.get("/matches/{id}")
def matches(id: int, db: Session = Depends(get_db)):
    # 1. Fetch current user
    current_user = db.query(User).filter(User.id == id).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Convert to NIS Dict format
    user_dict = {
        "user_id": current_user.id,
        "name": current_user.full_name,
        "age": current_user.age,
        "gender": current_user.gender,
        "location": current_user.city,
        "education_level": current_user.education,
        "occupation": current_user.occupation,
        "is_verified": current_user.kyc_status == "verified",
        "has_required_data": True
    }
    
    # 3. Fetch and Convert Preferences
    db_pref = current_user.preferences
    pref_dict = {}
    if db_pref:
        pref_dict = {
            "preferred_min_age": db_pref.preferred_age_min,
            "preferred_max_age": db_pref.preferred_age_max,
            "preferred_locations": [db_pref.preferred_city] if db_pref.preferred_city else [],
            "preferred_education_levels": [db_pref.preferred_education] if db_pref.preferred_education else [],
        }
        
    # 4. Fetch Verified Candidates (The KYC Rule)
    other_users = db.query(User).filter(User.id != id, User.kyc_status == "verified").all()
    candidate_dicts = []
    for u in other_users:
        candidate_dicts.append({
            "candidate_id": u.id,
            "profile": {
                "user_id": u.id,
                "name": u.full_name,
                "age": u.age,
                "gender": u.gender,
                "location": u.city,
                "education_level": u.education,
                "occupation": u.occupation,
                "is_verified": True,
                "has_required_data": True
            }
        })
        
    # 5. Map Dictionaries to Strict NIS Models using the NIS Adapter
    nis_user = map_db_user_to_user_profile(user_dict)
    nis_pref = map_db_preference_to_match_preference(pref_dict)
    nis_candidates = [map_db_candidate_to_candidate_profile(c) for c in candidate_dicts]
    
    # 6. Execute the Engine!
    result = NISMatchmakingService.generate_considered_few(
        current_user=nis_user,
        match_preference=nis_pref,
        candidates=nis_candidates
    )
    
    return result
