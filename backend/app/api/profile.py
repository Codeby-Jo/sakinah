from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.profile import ProfileCreate, ProfileResponse
from app.core.security import get_current_user
from app.core.firebase import get_db
from firebase_admin import firestore

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
    existing_profile = profile_ref.get()
    
    # Prepare data from Pydantic
    profile_data = profile_in.model_dump()
    profile_data["uid"] = uid
    profile_data["kyc_verified"] = False  # KYC is a separate flow
    profile_data["is_active"] = True
    profile_data["is_banned"] = False

    # Generate Sakinah ID if not already present
    if existing_profile.exists and existing_profile.to_dict().get("sakinah_id"):
        profile_data["sakinah_id"] = existing_profile.to_dict().get("sakinah_id")
    else:
        transaction = db.transaction()
        counter_ref = db.collection("metadata").document("counters")

        @firestore.transactional
        def get_and_increment_counter(transaction, counter_ref):
            snapshot = counter_ref.get(transaction=transaction)
            if not snapshot.exists:
                transaction.set(counter_ref, {"user_count": 1})
                return 1
            new_count = snapshot.get("user_count") + 1
            transaction.update(counter_ref, {"user_count": new_count})
            return new_count

        user_count = get_and_increment_counter(transaction, counter_ref)
        
        first_clean = (profile_in.firstName or "Seeker").replace(" ", "")
        last_clean = (profile_in.lastName or "").replace(" ", "")
        profile_data["sakinah_id"] = f"{first_clean}{last_clean}SAK{user_count}"
    
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
    profile_ref = db.collection("profiles").document(uid)
    profile_doc = profile_ref.get()
    
    if not profile_doc.exists:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    profile_data = profile_doc.to_dict()

    # Retroactive Sakinah ID generation for existing profiles
    if not profile_data.get("sakinah_id"):
        transaction = db.transaction()
        counter_ref = db.collection("metadata").document("counters")

        @firestore.transactional
        def get_and_increment_counter(transaction, counter_ref):
            snapshot = counter_ref.get(transaction=transaction)
            if not snapshot.exists:
                transaction.set(counter_ref, {"user_count": 1})
                return 1
            new_count = snapshot.get("user_count") + 1
            transaction.update(counter_ref, {"user_count": new_count})
            return new_count

        try:
            user_count = get_and_increment_counter(transaction, counter_ref)
            first_clean = (profile_data.get("firstName") or profile_data.get("first_name") or "Seeker").replace(" ", "")
            last_clean = (profile_data.get("lastName") or "").replace(" ", "")
            sakinah_id = f"{first_clean}{last_clean}SAK{user_count}"
            
            # Save it back to the database
            profile_ref.update({"sakinah_id": sakinah_id})
            profile_data["sakinah_id"] = sakinah_id
        except Exception as e:
            print(f"Failed to retroactively generate Sakinah ID: {e}")
            pass

    return profile_data
