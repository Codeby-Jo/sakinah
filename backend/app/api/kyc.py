from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.core.firebase import get_db
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SandboxPayload(BaseModel):
    outcome: str # "sandbox_pass" | "sandbox_fail" | "sandbox_review"

@router.post("/kyc/start")
async def start_kyc(current_user: dict = Depends(get_current_user)):
    return {
        "session_token": "mock_kyc_token",
        "verification_url": "http://localhost:5173/matrimony/kyc"
    }

@router.get("/kyc/status")
async def get_kyc_status(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {"status": "pending"}
        
    data = profile_doc.to_dict()
    return {"status": data.get("kyc_status", "pending")}

@router.post("/kyc/sandbox/complete")
async def submit_kyc_sandbox(
    payload: SandboxPayload,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    db = get_db()
    
    status_map = {
        "sandbox_pass": "verified",
        "sandbox_review": "pending_human_review",
        "sandbox_fail": "rejected"
    }
    
    result_status = status_map.get(payload.outcome, "verified")
    
    # Update profile in Firestore
    profile_ref = db.collection("profiles").document(uid)
    
    update_data = {
        "kyc_status": result_status,
        "kyc_verified": (result_status == "verified")
    }
    
    # Lock verified_gender and verified_age from the profile at time of KYC.
    # In production these would come from the government ID scan.
    # In sandbox we trust the self-declared profile values and lock them here.
    if result_status == "verified":
        existing_doc = profile_ref.get()
        if existing_doc.exists:
            existing = existing_doc.to_dict()
            update_data["verified_gender"] = (existing.get("gender") or "male").upper()
            update_data["verified_age"] = int(existing.get("age") or 25)
    
    try:
        profile_ref.set(update_data, merge=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
        
    return {
        "status": result_status,
        "message": f"KYC complete: {result_status}"
    }

@router.post("/liveness/start")
async def start_liveness(current_user: dict = Depends(get_current_user)):
    return {
        "session_token": "mock_liveness_token",
        "verification_url": "http://localhost:5173/matrimony/kyc"
    }

@router.get("/liveness/status")
async def get_liveness_status(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {"status": "pending"}
        
    data = profile_doc.to_dict()
    return {"status": data.get("liveness_status", "pending")}

@router.post("/liveness/sandbox/complete")
async def submit_liveness_sandbox(
    payload: SandboxPayload,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    db = get_db()
    
    status_map = {
        "sandbox_pass": "verified",
        "sandbox_review": "pending_human_review",
        "sandbox_fail": "rejected"
    }
    
    result_status = status_map.get(payload.outcome, "verified")
    
    profile_ref = db.collection("profiles").document(uid)
    update_data = {
        "liveness_status": result_status,
        "liveness_verified": (result_status == "verified")
    }
    
    try:
        profile_ref.set(update_data, merge=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
        
    return {
        "status": result_status,
        "message": f"Liveness complete: {result_status}"
    }

@router.get("/eligibility/me")
async def get_eligibility(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {"status": "NEEDS_VERIFICATION"}
        
    data = profile_doc.to_dict()
    is_eligible = data.get("kyc_verified") == True
    
    return {
        "status": "ELIGIBLE" if is_eligible else "NEEDS_VERIFICATION"
    }
