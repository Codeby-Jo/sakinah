import firebase_admin
from firebase_admin import credentials, firestore
import sys
import os
sys.path.append(os.path.abspath("../../backend"))

from app.api.matches import get_next_batch
from nis.engines import hard_filter_engine, safety_engine, preference_engine, psychology_engine, confidence_engine
from nis.engines.ranking_engine import calculate_internal_score
from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile

cred = credentials.Certificate("../../backend/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

adam_uid = "user_2e06518e"

user_profile = db.collection("profiles").document(adam_uid).get().to_dict()
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
for k, v in user_profile.items():
    if v is not None:
        user_data[k] = v

user_pref_doc = db.collection("preferences").document(adam_uid).get()
if user_pref_doc.exists:
    p = user_pref_doc.to_dict()
    user_data["pref_age_range"] = {"min": int(p.get("minAge") or 18), "max": int(p.get("maxAge") or 100)}
    if p.get("locationPref"): user_data["pref_location"] = p.get("locationPref")
    if p.get("maritalStatus"): user_data["pref_marital_status"] = p.get("maritalStatus")
    if p.get("educationPref"): user_data["pref_education_work"] = p.get("educationPref")
    if p.get("dealbreakers"): user_data["strict_dealbreakers"] = p.get("dealbreakers")
    if p.get("religiousPracticePref"): user_data["pref_religious_alignment"] = p.get("religiousPracticePref")
    if p.get("familyInvolvement"): user_data["family_wali_involvement"] = p.get("familyInvolvement")
    if p.get("communicationStyle"): user_data["communication_style"] = p.get("communicationStyle")
    if p.get("repairStyle"): user_data["conflict_repair"] = p.get("repairStyle")
    if p.get("boundarySafety"): user_data["boundary_emotional_safety"] = p.get("boundarySafety")
    if p.get("lifestyleFinances"): user_data["lifestyle_finances"] = p.get("lifestyleFinances")

user_kyc = SystemKycData(
    user_id=adam_uid,
    is_verified=True,
    verified_gender="MALE",
    verified_age=28,
    is_banned=False,
    safety_status="CLEAR"
)
user_input = TwentyQuestionInput(raw_answers=user_data, system_kyc=user_kyc)
adam_nis_profile, adam_nis_pref = TwentyInputProfileBuilder.build_profiles(user_input)

candidates_docs = db.collection("profiles").where("gender", "==", "female").get()
scores = []

for doc in candidates_docs:
    cand_data = doc.to_dict()
    cid = doc.id
    
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
            
    cand_pref_doc = db.collection("preferences").document(cid).get()
    if cand_pref_doc.exists:
        p = cand_pref_doc.to_dict()
        cand_data_clean["pref_age_range"] = {"min": int(p.get("minAge") or 18), "max": int(p.get("maxAge") or 100)}
        if p.get("locationPref"): cand_data_clean["pref_location"] = p.get("locationPref")
        if p.get("maritalStatus"): cand_data_clean["pref_marital_status"] = p.get("maritalStatus")
        if p.get("educationPref"): cand_data_clean["pref_education_work"] = p.get("educationPref")
        if p.get("dealbreakers"): cand_data_clean["strict_dealbreakers"] = p.get("dealbreakers")
        if p.get("religiousPracticePref"): cand_data_clean["pref_religious_alignment"] = p.get("religiousPracticePref")
        if p.get("familyInvolvement"): cand_data_clean["family_wali_involvement"] = p.get("familyInvolvement")
        if p.get("communicationStyle"): cand_data_clean["communication_style"] = p.get("communicationStyle")
        if p.get("repairStyle"): cand_data_clean["conflict_repair"] = p.get("repairStyle")
        if p.get("boundarySafety"): cand_data_clean["boundary_emotional_safety"] = p.get("boundarySafety")
        if p.get("lifestyleFinances"): cand_data_clean["lifestyle_finances"] = p.get("lifestyleFinances")
        
    cand_data_clean["gender"] = cand_data_clean["gender"].upper()
    
    cand_kyc = SystemKycData(
        user_id=cid,
        is_verified=True,
        verified_gender=cand_data_clean["gender"],
        verified_age=int(cand_data_clean["age"]),
        is_banned=False,
        safety_status="CLEAR"
    )
    cand_input = TwentyQuestionInput(raw_answers=cand_data_clean, system_kyc=cand_kyc)
    cand_nis_profile, cand_nis_pref = TwentyInputProfileBuilder.build_profiles(cand_input)
    
    cand_candidate = CandidateProfile(candidate_id=cid, profile=cand_nis_profile, known_dealbreaker_traits=[])
    
    s_res = safety_engine.evaluate_safety(cand_candidate)
    h_res = hard_filter_engine.evaluate_hard_filters(adam_nis_profile, cand_candidate, adam_nis_pref)
    p_res = preference_engine.evaluate_preferences(cand_candidate, adam_nis_pref)
    psy_res = psychology_engine.evaluate_psychology(adam_nis_profile, cand_candidate)
    
    c_res = confidence_engine.decide_visibility(
        safety_result=s_res,
        hard_filter_result=h_res,
        preference_result=p_res,
        psychology_result=psy_res
    )
    
    if c_res.get("status") == "SHOWN":
        score = calculate_internal_score(p_res, psy_res)
        scores.append((cid, score, cand_data.get("first_name")))

scores.sort(key=lambda x: x[1], reverse=True)
for s in scores:
    print(s)

