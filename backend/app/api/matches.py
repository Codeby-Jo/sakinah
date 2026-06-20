from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.core.firebase import get_db
from datetime import datetime, timedelta
import uuid

# NIS imports
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.models.mutual_interest_state import MutualInterestState
from nis.engines.mutual_interest_gate_engine import evaluate_mutual_interest_gate

router = APIRouter()

def map_candidate_to_summary(candidate_id: str, data: dict) -> dict:
    # Build a friendly resonance list based on matching characteristics
    res_list = [
        f"Location: {data.get('city') or data.get('location') or 'Not Specified'}",
        f"Sect/Tradition: {data.get('sect') or data.get('tradition') or 'Muslim'}"
    ]
    occupation = data.get("occupation")
    if occupation:
        res_list.append(f"Profession: {occupation.title()}")
        
    first_name = data.get("firstName") or data.get("first_name") or ""
    last_name = data.get("lastName") or data.get("last_name") or ""
    full_name = f"{first_name} {last_name}".strip()
    
    if not full_name:
        full_name = data.get("fullName") or f"Seeker {candidate_id[-4:]}"
        
    return {
        "candidateId": candidate_id,
        "id": candidate_id,
        "name": full_name,
        "displayName": full_name,
        "age": int(data.get("age") or 25),
        "location": data.get("city") or data.get("location") or "Unknown",
        "city": data.get("city") or data.get("location") or "Unknown",
        "profession": data.get("education_occupation") or data.get("occupation") or "Private",
        "sect": data.get("sect") or data.get("tradition") or "Islam",
        "prayerFrequency": data.get("prayerStatus") or "5_daily",
        "bioSnippet": (data.get("bio") or "")[:120] + ("..." if len(data.get("bio") or "") > 120 else ""),
        "resonance": res_list,
        "match_reasons": res_list
    }

@router.get("/considered-few")
async def get_considered_few(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    
    # 1. Check if considered set already exists in Firestore for today
    con_set_ref = db.collection("considered_sets").document(uid)
    con_set_doc = con_set_ref.get()
    
    if con_set_doc.exists:
        c_set_data = con_set_doc.to_dict()
        candidate_ids = c_set_data.get("candidate_ids", [])
        
        candidates_list = []
        for cid in candidate_ids:
            c_doc = db.collection("profiles").document(cid).get()
            if c_doc.exists:
                candidates_list.append(map_candidate_to_summary(cid, c_doc.to_dict()))
                
        if candidates_list:
            return {
                "status": "FOUND",
                "candidates": candidates_list
            }

    # 2. Get current user's profile — enforce KYC gate and Sakinah ban check
    user_profile_doc = db.collection("profiles").document(uid).get()
    if not user_profile_doc.exists:
        raise HTTPException(
            status_code=403,
            detail="Profile not found. Please complete your profile before accessing matches."
        )

    user_profile = user_profile_doc.to_dict()

    # KYC gate — block unverified users before calling NIS
    if not user_profile.get("kyc_verified"):
        raise HTTPException(
            status_code=403,
            detail="Identity verification (KYC) is required before accessing matches."
        )

    # Sakinah ban gate — banned from Sakinah only, not full account
    if user_profile.get("sakinah_banned"):
        raise HTTPException(
            status_code=403,
            detail="Your account has been removed from Sakinah due to community safety reports."
        )
        
    # Ensure required fields for TwentyQuestionInput have safe defaults if not present
    user_data = {
        "age": user_profile.get("age") or 25,
        "gender": (user_profile.get("gender") or "male").upper(),
        "location": user_profile.get("city") or user_profile.get("location") or "Chennai",
        "religious_practice_and_islamic_home": user_profile.get("religious_practice_level") or "MODERATE",
        "marriage_readiness": "READY",
        "pref_age_range": {"min": 18, "max": 100},
        "pref_location": [],
        "pref_marital_status": "NO_STRICT_PREFERENCE",
        "pref_height_or_physical_preference": "NO_STRICT_HEIGHT_PREFERENCE",
        "pref_religious_alignment": "FLEXIBLE",
        "pref_education_work": [],
        "family_wali_involvement": "STANDARD",
        "marriage_timeline": "FLEXIBLE",
        "strict_dealbreakers": [],
        "communication_style": "UNKNOWN",
        "conflict_repair": "UNKNOWN",
        "boundary_emotional_safety": "UNKNOWN",
        "lifestyle_finances": "UNKNOWN"
    }
    # Merge existing profile keys
    for k, v in user_profile.items():
        if v is not None:
            user_data[k] = v
    if "gender" in user_data and isinstance(user_data["gender"], str):
        user_data["gender"] = user_data["gender"].upper()

    # 3. Fetch Candidate Pool
    opposite_gender = "female" if user_data["gender"].lower() == "male" else "male"
    candidates_docs = db.collection("profiles").where("gender", "==", opposite_gender).get()
    
    candidates_nis = []
    for doc in candidates_docs:
        cand_data = doc.to_dict()
        cid = doc.id
        
        # Don't match with self, banned users, or Sakinah-banned users
        if cid == uid or cand_data.get("is_banned") == True or cand_data.get("sakinah_banned") == True:
            continue
            
        cand_data_clean = {
            "age": cand_data.get("age") or 25,
            "gender": (cand_data.get("gender") or "female").upper(),
            "location": cand_data.get("city") or cand_data.get("location") or "Chennai",
            "religious_practice_and_islamic_home": cand_data.get("religious_practice_level") or "MODERATE",
            "marriage_readiness": "READY",
            "pref_age_range": {"min": 18, "max": 100},
            "pref_location": [],
            "pref_marital_status": "NO_STRICT_PREFERENCE",
            "pref_height_or_physical_preference": "NO_STRICT_HEIGHT_PREFERENCE",
            "pref_religious_alignment": "FLEXIBLE",
            "pref_education_work": [],
            "family_wali_involvement": "STANDARD",
            "marriage_timeline": "FLEXIBLE",
            "strict_dealbreakers": [],
            "communication_style": "UNKNOWN",
            "conflict_repair": "UNKNOWN",
            "boundary_emotional_safety": "UNKNOWN",
            "lifestyle_finances": "UNKNOWN"
        }
        for k, v in cand_data.items():
            if v is not None:
                cand_data_clean[k] = v
        # Ensure gender is uppercase
        if "gender" in cand_data_clean and isinstance(cand_data_clean["gender"], str):
            cand_data_clean["gender"] = cand_data_clean["gender"].upper()
                
        cand_kyc = SystemKycData(
            user_id=cid,
            is_verified=cand_data.get("kyc_verified") == True,
            verified_gender=cand_data_clean["gender"],
            verified_age=int(cand_data_clean["age"]),
            is_banned=cand_data.get("sakinah_banned", False),  # NIS engine also checks this
            safety_status="CLEAR"
        )
        cand_twenty_input = TwentyQuestionInput(
            raw_answers=cand_data_clean,
            system_kyc=cand_kyc
        )
        cand_nis_profile, cand_nis_pref = TwentyInputProfileBuilder.build_profiles(cand_twenty_input)
        
        candidates_nis.append(CandidateProfile(
            candidate_id=cid,
            profile=cand_nis_profile,
            known_dealbreaker_traits=cand_nis_pref.dealbreakers if hasattr(cand_nis_pref, "dealbreakers") else []
        ))
        
    # 4. Get User Shown/Passed History
    shown_ids = []
    passed_ids = []
    interactions = db.collection("candidate_interactions").where("seeker_id", "==", uid).get()
    for doc in interactions:
        idata = doc.to_dict()
        if idata.get("status") == "PASS":
            passed_ids.append(idata.get("candidate_id"))
        else:
            shown_ids.append(idata.get("candidate_id"))

    # 5. Build User NIS objects
    # Use verified_gender and verified_age locked at KYC time — not self-declared frontend values
    verified_gender = user_profile.get("verified_gender") or user_data["gender"]
    verified_age = int(user_profile.get("verified_age") or user_data["age"])

    user_kyc = SystemKycData(
        user_id=uid,
        is_verified=user_profile.get("kyc_verified") == True,
        verified_gender=verified_gender,
        verified_age=verified_age,
        is_banned=False,
        safety_status="CLEAR"
    )
    user_twenty_input = TwentyQuestionInput(
        raw_answers=user_data,
        system_kyc=user_kyc
    )
    user_nis_profile, user_nis_pref = TwentyInputProfileBuilder.build_profiles(user_twenty_input)

    # Fetch active conversation candidate IDs dynamically so NIS excludes them
    active_convo_ids = []
    try:
        convs_a = db.collection("conversations").where("seeker_a_id", "==", uid).where("status", "==", "ACTIVE").get()
        convs_b = db.collection("conversations").where("seeker_b_id", "==", uid).where("status", "==", "ACTIVE").get()
        for doc in list(convs_a) + list(convs_b):
            c = doc.to_dict()
            other = c.get("seeker_b_id") if c.get("seeker_a_id") == uid else c.get("seeker_a_id")
            if other:
                active_convo_ids.append(other)
    except Exception:
        pass

    pool_context = CandidatePoolContext(
        seeker_id=uid,
        active_conversations_count=len(active_convo_ids),
        max_active_conversations=2,
        shown_candidate_ids=shown_ids,
        passed_candidate_ids=passed_ids,
        blocked_candidate_ids=[],
        active_conversation_candidate_ids=active_convo_ids,
        max_considered_candidates=3
    )

    # 6. Run Engine
    result = NISMatchmakingService.generate_considered_few(
        current_user=user_nis_profile,
        match_preference=user_nis_pref,
        candidates=candidates_nis,
        pool_context=pool_context
    )
    
    candidates_list = []
    candidate_ids = []
    candidate_names = {}
    
    # Get seeker name
    user_auth_doc = db.collection("users").document(uid).get()
    seeker_name = user_auth_doc.to_dict().get("name", "Seeker") if user_auth_doc.exists else "Seeker"
    
    # Extract candidates
    for c in result.get("candidates", []):
        cid = c["candidate_id"]
        candidate_ids.append(cid)
        c_doc = db.collection("profiles").document(cid).get()
        c_auth_doc = db.collection("users").document(cid).get()
        c_name = c_auth_doc.to_dict().get("name", "Candidate") if c_auth_doc.exists else "Candidate"
        candidate_names[cid] = c_name
        
        if c_doc.exists:
            candidates_list.append(map_candidate_to_summary(cid, c_doc.to_dict()))
            
    # Save considered set — full metadata required by integration guide
    if candidate_ids:
        con_set_ref.set({
            "considered_set_id": uid,
            "seeker_id": uid,
            "seeker_name": seeker_name,
            "candidate_ids": candidate_ids,
            "candidate_names": candidate_names,
            "batch_number": 1,
            "status": "ACTIVE",
            "source": "NIS",
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        })
        
    return {
        "status": "FOUND" if candidates_list else "NO_SUITABLE_MATCHES_RIGHT_NOW",
        "candidates": candidates_list
    }

@router.get("/candidates/{candidate_id}")
async def get_candidate(candidate_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    c_doc = db.collection("profiles").document(candidate_id).get()
    if not c_doc.exists:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    return map_candidate_to_summary(candidate_id, c_doc.to_dict())

@router.post("/candidates/{candidate_id}/pass")
async def pass_candidate(candidate_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    
    seeker_auth = db.collection("users").document(uid).get()
    cand_auth = db.collection("users").document(candidate_id).get()
    seeker_name = seeker_auth.to_dict().get("name", "Seeker") if seeker_auth.exists else "Seeker"
    cand_name = cand_auth.to_dict().get("name", "Candidate") if cand_auth.exists else "Candidate"
    
    interaction_id = f"{uid}_{candidate_id}"
    now = datetime.utcnow().isoformat()
    db.collection("candidate_interactions").document(interaction_id).set({
        "seeker_id": uid,
        "seeker_name": seeker_name,
        "candidate_id": candidate_id,
        "candidate_name": cand_name,
        "status": "PASS",
        "passed_at": now,
        "updated_at": now,
        "batch_number": 1
    })
    
    return {"status": "success", "message": "Candidate passed silently."}

@router.post("/candidates/{candidate_id}/interest")
async def express_interest(candidate_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    
    seeker_auth = db.collection("users").document(uid).get()
    cand_auth = db.collection("users").document(candidate_id).get()
    seeker_name = seeker_auth.to_dict().get("name", "Seeker") if seeker_auth.exists else "Seeker"
    cand_name = cand_auth.to_dict().get("name", "Candidate") if cand_auth.exists else "Candidate"
    
    interaction_id = f"{uid}_{candidate_id}"
    now = datetime.utcnow().isoformat()
    db.collection("candidate_interactions").document(interaction_id).set({
        "seeker_id": uid,
        "seeker_name": seeker_name,
        "candidate_id": candidate_id,
        "candidate_name": cand_name,
        "status": "INTEREST",
        "interest_at": now,
        "updated_at": now,
        "batch_number": 1
    })
    
    # Auto-evaluate mutual interest
    opp_interaction_id = f"{candidate_id}_{uid}"
    opp_doc = db.collection("candidate_interactions").document(opp_interaction_id).get()
    
    is_mutual = False
    convo_id = ""
    
    if opp_doc.exists and opp_doc.to_dict().get("status") == "INTEREST":
        is_mutual = True
        convo_id = f"convo_{uid[:4]}_{candidate_id[:4]}"
        
        # Create mutual match
        db.collection("matches").document(convo_id).set({
            "match_id": convo_id,
            "users": [uid, candidate_id],
            "user_names": {uid: seeker_name, candidate_id: cand_name},
            "matched_at": datetime.utcnow().isoformat()
        })
        
        # Create conversation
        db.collection("conversations").document(convo_id).set({
            "conversation_id": convo_id,
            "seeker_a_id": uid,
            "seeker_a_name": seeker_name,
            "seeker_b_id": candidate_id,
            "seeker_b_name": cand_name,
            "status": "ACTIVE",
            "matchflow_step": "CONVERSATION_OPEN",
            "photo_unlocked": False,
            "created_at": datetime.utcnow().isoformat()
        })
        
        # Add welcome system message
        welcome_msg_ref = db.collection("conversations").document(convo_id).collection("messages").document()
        welcome_msg_ref.set({
            "sender_id": "system",
            "text": "Match created! You can now start communicating.",
            "msg_type": "system",
            "created_at": datetime.utcnow().isoformat()
        })
        
    if is_mutual:
        return {
            "status": "mutual_interest",
            "message": "Mutual interest confirmed!",
            "conversation_id": convo_id
        }
        
    return {
        "status": "success",
        "message": "Interest recorded privately."
    }

@router.post("/mutual-interest/evaluate")
async def evaluate_mutual_interest_endpoint(candidate_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    
    # Get interaction documents
    my_doc = db.collection("candidate_interactions").document(f"{uid}_{candidate_id}").get()
    opp_doc = db.collection("candidate_interactions").document(f"{candidate_id}_{uid}").get()
    
    my_interest = my_doc.exists and my_doc.to_dict().get("status") == "INTEREST"
    my_pass = my_doc.exists and my_doc.to_dict().get("status") == "PASS"
    opp_interest = opp_doc.exists and opp_doc.to_dict().get("status") == "INTEREST"
    opp_pass = opp_doc.exists and opp_doc.to_dict().get("status") == "PASS"
    
    state = MutualInterestState(
        seeker_id=uid,
        candidate_id=candidate_id,
        seeker_interested=my_interest,
        candidate_interested=opp_interest,
        seeker_passed=my_pass,
        candidate_passed=opp_pass
    )
    
    gate_result = evaluate_mutual_interest_gate(state)
    return {"status": gate_result.get("status")}

@router.get("/matchflows/{matchflow_id}")
async def get_matchflow_endpoint(matchflow_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    convo_doc = db.collection("conversations").document(matchflow_id).get()
    
    if not convo_doc.exists:
        return {
            "matchflow_id": matchflow_id,
            "current_step": "CONVERSATION_OPEN",
            "steps": []
        }
        
    data = convo_doc.to_dict()
    return {
        "matchflow_id": matchflow_id,
        "current_step": data.get("matchflow_step", "CONVERSATION_OPEN"),
        "steps": []
    }

@router.post("/matchflows/{matchflow_id}/decision")
async def submit_decision_endpoint(
    matchflow_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    convo_ref = db.collection("conversations").document(matchflow_id)
    
    # Frontend sends { outcome }, backend also accepts { decision } — accept both
    decision = payload.get("outcome") or payload.get("decision")  # PROCEED | PAUSE | CLOSE
    
    if decision == "CLOSE":
        convo_ref.update({
            "status": "CLOSED",
            "matchflow_step": "MATCH_CLOSED"
        })
    elif decision == "PROCEED":
        convo_ref.update({
            "matchflow_step": "CONVERSATION_OPEN"
        })
        
    return {"status": "success"}


# ---------------------------------------------------------------------------
# Next-Batch Endpoint — returns candidates 11–20 (batch 2)
# ---------------------------------------------------------------------------
@router.get("/next-batch")
async def get_next_batch(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()

    # 1. KYC gate + Sakinah ban gate
    user_profile_doc = db.collection("profiles").document(uid).get()
    if not user_profile_doc.exists:
        raise HTTPException(status_code=403, detail="Profile not found.")
    user_profile = user_profile_doc.to_dict()
    if not user_profile.get("kyc_verified"):
        raise HTTPException(status_code=403, detail="KYC verification required.")
    if user_profile.get("sakinah_banned"):
        raise HTTPException(status_code=403, detail="Your account has been removed from Sakinah due to community safety reports.")

    # 2. Build user NIS input
    user_data = {
        "age": user_profile.get("age") or 25,
        "gender": (user_profile.get("verified_gender") or user_profile.get("gender") or "male").upper(),
        "location": user_profile.get("city") or user_profile.get("location") or "Chennai",
        "religious_practice_and_islamic_home": user_profile.get("religious_practice_level") or "MODERATE",
        "marriage_readiness": "READY",
        "pref_age_range": {"min": 18, "max": 100},
        "pref_location": [],
        "pref_marital_status": "NO_STRICT_PREFERENCE",
        "pref_height_or_physical_preference": "NO_STRICT_HEIGHT_PREFERENCE",
        "pref_religious_alignment": "FLEXIBLE",
        "pref_education_work": [],
        "family_wali_involvement": "STANDARD",
        "marriage_timeline": "FLEXIBLE",
        "strict_dealbreakers": [],
        "communication_style": "UNKNOWN",
        "conflict_repair": "UNKNOWN",
        "boundary_emotional_safety": "UNKNOWN",
        "lifestyle_finances": "UNKNOWN"
    }
    for k, v in user_profile.items():
        if v is not None:
            user_data[k] = v

    # 3. Fetch all shown, passed, active conversation IDs (these are excluded from batch 2)
    shown_ids, passed_ids = [], []
    interactions = db.collection("candidate_interactions").where("seeker_id", "==", uid).get()
    for doc in interactions:
        idata = doc.to_dict()
        if idata.get("status") == "PASS":
            passed_ids.append(idata.get("candidate_id"))
        else:
            shown_ids.append(idata.get("candidate_id"))

    active_convo_ids = []
    try:
        convs_a = db.collection("conversations").where("seeker_a_id", "==", uid).where("status", "==", "ACTIVE").get()
        convs_b = db.collection("conversations").where("seeker_b_id", "==", uid).where("status", "==", "ACTIVE").get()
        for doc in list(convs_a) + list(convs_b):
            c = doc.to_dict()
            other = c.get("seeker_b_id") if c.get("seeker_a_id") == uid else c.get("seeker_a_id")
            if other:
                active_convo_ids.append(other)
    except Exception:
        pass

    # 4. Fetch candidate pool
    opposite_gender = "female" if user_data["gender"].lower() == "male" else "male"
    candidates_docs = db.collection("profiles").where("gender", "==", opposite_gender).get()

    candidates_nis = []
    for doc in candidates_docs:
        cand_data = doc.to_dict()
        cid = doc.id
        if cid == uid or cand_data.get("is_banned") == True or cand_data.get("sakinah_banned") == True:
            continue
        cand_clean = {
            "age": cand_data.get("age") or 25,
            "gender": (cand_data.get("gender") or "female").upper(),
            "location": cand_data.get("city") or cand_data.get("location") or "Chennai",
            "religious_practice_and_islamic_home": cand_data.get("religious_practice_level") or "MODERATE",
            "marriage_readiness": "READY",
            "pref_age_range": {"min": 18, "max": 100},
            "pref_location": [], "pref_marital_status": "NO_STRICT_PREFERENCE",
            "pref_height_or_physical_preference": "NO_STRICT_HEIGHT_PREFERENCE",
            "pref_religious_alignment": "FLEXIBLE", "pref_education_work": [],
            "family_wali_involvement": "STANDARD", "marriage_timeline": "FLEXIBLE",
            "strict_dealbreakers": [], "communication_style": "UNKNOWN",
            "conflict_repair": "UNKNOWN", "boundary_emotional_safety": "UNKNOWN",
            "lifestyle_finances": "UNKNOWN"
        }
        for k, v in cand_data.items():
            if v is not None:
                cand_clean[k] = v
        cand_kyc = SystemKycData(
            user_id=cid,
            is_verified=cand_data.get("kyc_verified") == True,
            verified_gender=cand_clean["gender"],
            verified_age=int(cand_clean["age"]),
            is_banned=cand_data.get("sakinah_banned", False),  # NIS engine also checks this
            safety_status="CLEAR"
        )
        cand_input = TwentyQuestionInput(raw_answers=cand_clean, system_kyc=cand_kyc)
        cand_profile, cand_pref = TwentyInputProfileBuilder.build_profiles(cand_input)
        candidates_nis.append(CandidateProfile(
            candidate_id=cid,
            profile=cand_profile,
            known_dealbreaker_traits=cand_pref.dealbreakers if hasattr(cand_pref, "dealbreakers") else []
        ))

    # 5. Build user NIS profile
    user_kyc = SystemKycData(
        user_id=uid,
        is_verified=True,
        verified_gender=user_data["gender"],
        verified_age=int(user_profile.get("verified_age") or user_data["age"]),
        is_banned=False,
        safety_status="CLEAR"
    )
    user_input = TwentyQuestionInput(raw_answers=user_data, system_kyc=user_kyc)
    user_nis_profile, user_nis_pref = TwentyInputProfileBuilder.build_profiles(user_input)

    # 6. CandidatePoolContext — batch 2 with all shown/passed/active excluded
    pool_context = CandidatePoolContext(
        seeker_id=uid,
        active_conversations_count=len(active_convo_ids),
        max_active_conversations=2,
        shown_candidate_ids=shown_ids,
        passed_candidate_ids=passed_ids,
        blocked_candidate_ids=[],
        active_conversation_candidate_ids=active_convo_ids,
        max_considered_candidates=3
    )

    # 7. Call NIS
    result = NISMatchmakingService.generate_considered_few(
        current_user=user_nis_profile,
        match_preference=user_nis_pref,
        candidates=candidates_nis,
        pool_context=pool_context
    )

    candidates_list = []
    candidate_ids = []
    candidate_names = {}
    
    # Get seeker name
    user_auth_doc = db.collection("users").document(uid).get()
    seeker_name = user_auth_doc.to_dict().get("name", "Seeker") if user_auth_doc.exists else "Seeker"
    
    for c in result.get("candidates", []):
        cid = c["candidate_id"]
        candidate_ids.append(cid)
        c_doc = db.collection("profiles").document(cid).get()
        c_auth_doc = db.collection("users").document(cid).get()
        c_name = c_auth_doc.to_dict().get("name", "Candidate") if c_auth_doc.exists else "Candidate"
        candidate_names[cid] = c_name
        
        if c_doc.exists:
            candidates_list.append(map_candidate_to_summary(cid, c_doc.to_dict()))

    # 8. Store new considered set for batch 2
    if candidate_ids:
        now = datetime.utcnow().isoformat()
        db.collection("considered_sets").document(f"{uid}_batch2").set({
            "considered_set_id": f"{uid}_batch2",
            "seeker_id": uid,
            "seeker_name": seeker_name,
            "candidate_ids": candidate_ids,
            "candidate_names": candidate_names,
            "batch_number": 2,
            "status": "ACTIVE",
            "source": "NIS",
            "created_at": now,
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        })

    return {
        "status": "FOUND" if candidates_list else "NO_MORE_CANDIDATES_IN_THIS_BATCH",
        "candidates": candidates_list,
        "batch_number": 2
    }

@router.get("/interests")
async def get_interests(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    
    sent_docs = db.collection("candidate_interactions").where("seeker_id", "==", uid).where("status", "==", "INTEREST").get()
    recv_docs = db.collection("candidate_interactions").where("candidate_id", "==", uid).where("status", "==", "INTEREST").get()
    
    sent = []
    for doc in sent_docs:
        cid = doc.to_dict().get("candidate_id")
        user_doc = db.collection("sakinah_profiles").document(cid).get()
        if user_doc.exists:
            ud = user_doc.to_dict()
            sent.append({
                "id": cid,
                "name": ud.get("name", "Unknown"),
                "age": ud.get("age", 25),
                "city": ud.get("location", ud.get("city", "Unknown")),
                "date": "Just now",
                "initial": ud.get("name", "U")[0].upper()
            })
            
    recv = []
    for doc in recv_docs:
        sid = doc.to_dict().get("seeker_id")
        user_doc = db.collection("sakinah_profiles").document(sid).get()
        if user_doc.exists:
            ud = user_doc.to_dict()
            recv.append({
                "id": sid,
                "name": ud.get("name", "Unknown"),
                "age": ud.get("age", 25),
                "city": ud.get("location", ud.get("city", "Unknown")),
                "date": "Just now",
                "initial": ud.get("name", "U")[0].upper()
            })
            
    return {"sent": sent, "received": recv}
