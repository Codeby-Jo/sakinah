from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.core.firebase import get_db

router = APIRouter()

@router.get("/readiness/home")
async def get_readiness_home(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {
            "niyyahStatus": "NOT_STARTED",
            "valuesStatus": "NOT_STARTED",
            "mirrorStatus": "NOT_STARTED",
            "portraitStatus": "NOT_STARTED"
        }
        
    data = profile_doc.to_dict()
    
    return {
        "niyyahStatus": "COMPLETED" if data.get("niyyah") else "NOT_STARTED",
        "valuesStatus": "COMPLETED" if data.get("values") else "NOT_STARTED",
        "mirrorStatus": "COMPLETED" if data.get("mirrorAnswers") else "NOT_STARTED",
        "portraitStatus": "COMPLETED" if data.get("portraitAnswers") else "NOT_STARTED"
    }

# --- Niyyah (Intention) ---
@router.get("/niyyah/me")
async def get_niyyah(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {"niyyah": ""}
        
    data = profile_doc.to_dict()
    return {"niyyah": data.get("niyyah", "")}

@router.put("/niyyah/me")
async def update_niyyah(payload: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_ref = db.collection("profiles").document(uid)
    
    niyyah_text = payload.get("niyyah", "")
    profile_ref.set({"niyyah": niyyah_text}, merge=True)
    return {"status": "success", "niyyah": niyyah_text}

# --- Values ---
@router.get("/values/me")
async def get_values(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {"values": []}
        
    data = profile_doc.to_dict()
    return {"values": data.get("values", [])}

@router.put("/values/me")
async def update_values(payload: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_ref = db.collection("profiles").document(uid)
    
    values_list = payload.get("values", [])
    profile_ref.set({"values": values_list}, merge=True)
    return {"status": "success", "values": values_list}

# --- Mirror (Character traits) ---
@router.get("/mirror/me")
async def get_mirror(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {"mirrorAnswers": {}}
        
    data = profile_doc.to_dict()
    return {"mirrorAnswers": data.get("mirrorAnswers", {})}

@router.put("/mirror/me")
async def update_mirror(payload: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_ref = db.collection("profiles").document(uid)
    
    mirror_ans = payload.get("mirrorAnswers", {})
    profile_ref.set({"mirrorAnswers": mirror_ans}, merge=True)
    return {"status": "success", "mirrorAnswers": mirror_ans}

# --- Portrait (Psychological profile) ---
@router.get("/portrait/me")
async def get_portrait(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_doc = db.collection("profiles").document(uid).get()
    
    if not profile_doc.exists:
        return {"portraitAnswers": {}}
        
    data = profile_doc.to_dict()
    return {"portraitAnswers": data.get("portraitAnswers", {})}

@router.put("/portrait/me")
async def update_portrait(payload: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    profile_ref = db.collection("profiles").document(uid)
    
    portrait_ans = payload.get("portraitAnswers", {})
    profile_ref.set({"portraitAnswers": portrait_ans}, merge=True)
    return {"status": "success", "portraitAnswers": portrait_ans}
