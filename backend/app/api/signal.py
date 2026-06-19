from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.signal import SignalCreate, SignalResponse, MatchResponse
from app.core.security import get_current_user
from app.core.firebase import get_db
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=SignalResponse, status_code=status.HTTP_201_CREATED)
async def express_interest(
    signal_in: SignalCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Server-Authoritative Signaling:
    User A expresses interest in User B.
    If User B already expressed interest in User A, it triggers a mutual Match.
    (No rejection notifications, no feeds).
    """
    from_uid = current_user.get("uid")
    target_uid = signal_in.target_uid
    
    if from_uid == target_uid:
        raise HTTPException(status_code=400, detail="Cannot signal yourself")
        
    db = get_db()
    
    # Check if target already signaled current_user
    # (Using a composite ID for the signal doc: "from_to")
    reverse_signal_id = f"{target_uid}_{from_uid}"
    reverse_signal_ref = db.collection("signals").document(reverse_signal_id)
    reverse_signal_doc = reverse_signal_ref.get()
    
    is_mutual = reverse_signal_doc.exists
    
    # Save the current user's signal
    signal_id = f"{from_uid}_{target_uid}"
    signal_data = {
        "from_uid": from_uid,
        "target_uid": target_uid,
        "timestamp": datetime.utcnow().isoformat(),
        "is_mutual": is_mutual
    }
    db.collection("signals").document(signal_id).set(signal_data)
    
    if is_mutual:
        # Create a Match Document (Unlocks photos/chat)
        match_id = f"match_{str(uuid.uuid4())[:8]}"
        match_data = {
            "match_id": match_id,
            "users": [from_uid, target_uid],
            "matched_at": datetime.utcnow().isoformat()
        }
        db.collection("matches").document(match_id).set(match_data)
        
        # Also update the reverse signal to indicate it's mutual now
        reverse_signal_ref.update({"is_mutual": True})
        
    return {**signal_data, "id": signal_id}

@router.get("/matches", response_model=list[MatchResponse])
async def get_my_matches(current_user: dict = Depends(get_current_user)):
    """
    Only returns mutual matches. 
    (This is the only place photos/real identity should be revealed to the client).
    """
    uid = current_user.get("uid")
    db = get_db()
    
    matches_query = db.collection("matches").where("users", "array_contains", uid).stream()
    
    results = []
    for doc in matches_query:
        results.append(doc.to_dict())
        
    return results
