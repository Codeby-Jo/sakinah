from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.preferences import MatchPreferenceCreate, MatchPreferenceResponse
from app.core.security import get_current_user
from app.core.firebase import get_db

router = APIRouter()

@router.get("/me", response_model=MatchPreferenceResponse)
async def get_my_preferences(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    pref_doc = db.collection("preferences").document(uid).get()
    
    if not pref_doc.exists:
        # Return default preferences
        return {
            "uid": uid,
            "ageRangeMin": 18,
            "ageRangeMax": 100,
            "sectPreference": "No Preference",
            "relocationWillingness": True,
            "hardFilters": []
        }
        
    data = pref_doc.to_dict()
    data["uid"] = uid
    return data

@router.put("/me", response_model=MatchPreferenceResponse)
async def update_my_preferences(
    pref_in: MatchPreferenceCreate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    db = get_db()
    pref_ref = db.collection("preferences").document(uid)
    
    pref_data = pref_in.model_dump()
    pref_data["uid"] = uid
    
    try:
        pref_ref.set(pref_data, merge=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    return pref_data
