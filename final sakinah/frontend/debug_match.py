import firebase_admin
from firebase_admin import credentials, firestore
import sys

# Hack python path to import app and nis
import os
sys.path.append(os.path.abspath("../../backend"))

from app.api.matches import get_next_batch
from nis.engines import hard_filter_engine, safety_engine, preference_engine, psychology_engine, confidence_engine
from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile

cred = credentials.Certificate("../../backend/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

adam_uid = "user_2e06518e"
sara_uid = "user_08f956e4"

adam_prof = db.collection("profiles").document(adam_uid).get().to_dict()
sara_prof = db.collection("profiles").document(sara_uid).get().to_dict()

# Simulate Adam's fetch
user_data = {
    "age": adam_prof.get("age") or 25,
    "gender": (adam_prof.get("gender") or "male").upper(),
    "location": adam_prof.get("city") or adam_prof.get("location") or "Chennai",
    "religious_practice_and_islamic_home": adam_prof.get("religious_practice_level") or "MODERATE",
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
for k, v in adam_prof.items():
    if v is not None:
        user_data[k] = v
user_data["gender"] = user_data["gender"].upper()

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

# Sara as candidate
cand_data = {
    "age": sara_prof.get("age") or 25,
    "gender": (sara_prof.get("gender") or "female").upper(),
    "location": sara_prof.get("city") or sara_prof.get("location") or "Chennai",
    "religious_practice_and_islamic_home": sara_prof.get("religious_practice_level") or "MODERATE",
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
for k, v in sara_prof.items():
    if v is not None:
        cand_data[k] = v
cand_data["gender"] = cand_data["gender"].upper()

cand_kyc = SystemKycData(
    user_id=sara_uid,
    is_verified=True,
    verified_gender="FEMALE",
    verified_age=25,
    is_banned=False,
    safety_status="CLEAR"
)
cand_input = TwentyQuestionInput(raw_answers=cand_data, system_kyc=cand_kyc)
sara_nis_profile, sara_nis_pref = TwentyInputProfileBuilder.build_profiles(cand_input)

sara_candidate = CandidateProfile(candidate_id=sara_uid, profile=sara_nis_profile, known_dealbreaker_traits=[])

print("Safety:", safety_engine.evaluate_safety(sara_candidate))
print("Hard:", hard_filter_engine.evaluate_hard_filters(adam_nis_profile, sara_candidate, adam_nis_pref))
print("Pref:", preference_engine.evaluate_preferences(sara_candidate, adam_nis_pref))
print("Psy:", psychology_engine.evaluate_psychology(adam_nis_profile, sara_candidate))
