from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.profile import ProfileCreate, ProfileResponse
from app.core.security import get_current_user
from app.core.firebase import get_db

router = APIRouter()

@router.post("/me", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(
    profile_in: ProfileCreate, 
    current_user: dict = Depends(get_current_user)
):
    """
    Server-Authoritative Profile Creation.
    Ensures that a user can only create/update their own profile using the UID from the token.
    """
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=400, detail="Invalid token structure")
    
    db = get_db()
    profile_ref = db.collection("profiles").document(uid)
    
    # Prepare data from Pydantic
    profile_data = profile_in.model_dump()
    profile_data["uid"] = uid
    profile_data["kyc_verified"] = False  # KYC is a separate flow
    profile_data["is_active"] = True
    profile_data["is_banned"] = False
    
    # Pre-populate some derived properties for compatibility with legacy systems
    profile_data["fullName"] = f"{profile_in.firstName or ''} {profile_in.lastName or ''}".strip() or "Seeker"
    profile_data["first_name"] = profile_in.firstName or "Seeker"
    
    # Keep age as string to match ProfileResponse schema (age: str)
    try:
        profile_data["age"] = str(int(profile_in.age))
    except Exception:
        profile_data["age"] = "25"
            
    profile_data["location"] = profile_in.location
    profile_data["city"] = profile_in.location
    profile_data["sect"] = profile_in.religious_practice_and_islamic_home
    profile_data["gender"] = (profile_in.gender or "male").lower()
    
    # Save to Firestore
    try:
        profile_ref.set(profile_data, merge=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return profile_data

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Fetch the current user's profile."""
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return profile_doc.to_dict()
