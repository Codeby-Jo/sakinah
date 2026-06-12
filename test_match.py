import sys
import os
sys.path.append("/home/joshuaraja/Downloads/sakinahh/frontend/backend")

from database import SessionLocal
from models import User
from routes.match import map_db_user_to_user_profile, map_db_candidate_to_candidate_profile, map_db_preference_to_match_preference
from nis.engines.hard_filter_engine import evaluate_hard_filters
from nis.engines.vulnerability_protection_engine import evaluate_vulnerability_protection
from nis.engines.psychology_engine import evaluate_psychology

db = SessionLocal()
tariq = db.query(User).filter_by(id=2).first()
aisha = db.query(User).filter_by(id=1).first()

if not tariq or not aisha:
    print("Missing users")
    exit()

def get_user_dict(u):
    psy_prof = u.psychological_profile
    db_pref = u.preferences
    return {
        "user_id": u.id, "name": u.full_name, "age": u.age, "gender": u.gender,
        "location": u.city, "education_level": u.education, "occupation": u.occupation,
        "is_verified": u.kyc_status == "verified", "is_banned": u.is_banned,
        "safety_status": u.safety_status, "has_required_data": True,
        "marital_status": db_pref.marital_status if db_pref else "NEVER_MARRIED",
        "work_outlook": db_pref.work_outlook if db_pref else None,
        "islamic_environment_preference": db_pref.islamic_env_pref if db_pref else None,
        "religious_practice_level": db_pref.preferred_religious_level if db_pref else None,
        "communication_style": psy_prof.communication_style if psy_prof else "Calm", 
        "tradition": db_pref.tradition_pref if db_pref else "Sunni",
        "anger_level": psy_prof.anger_level if psy_prof else None,
        "repair_style": psy_prof.conflict_resolution if psy_prof else None,
        "boundary_strength": psy_prof.boundary_strength if psy_prof else None,
        "emotional_steadiness": psy_prof.emotional_steadiness if psy_prof else None,
        "financial_responsibility": psy_prof.financial_responsibility if psy_prof else None,
        "lifestyle_pattern": psy_prof.lifestyle_pattern if psy_prof else None,
        "_raw_psychological_profile": psy_prof
    }

def get_pref_dict(u):
    db_pref = u.preferences
    psy_prof = u.psychological_profile
    return {
            "preferred_min_age": db_pref.preferred_age_min, "preferred_max_age": db_pref.preferred_age_max,
            "preferred_locations": [db_pref.preferred_city] if db_pref.preferred_city else [],
            "preferred_education_levels": [db_pref.preferred_education] if db_pref.preferred_education else [],
            "age_is_strict": db_pref.strict_age,
            "location_is_strict": db_pref.strict_location,
            "tradition_is_strict": db_pref.strict_tradition,
            "marital_status_is_strict": db_pref.strict_marital,
            "preferred_marital_statuses": [db_pref.marital_status] if db_pref.marital_status else [],
            "preferred_tradition": db_pref.tradition_pref,
            "preferred_islamic_environment": db_pref.islamic_env_pref,
            "preferred_work_outlook": [db_pref.work_outlook] if db_pref.work_outlook else [],
            "family_involvement_preference": db_pref.family_involvement,
            "communication_preference": psy_prof.communication_style if psy_prof else None,
            "custom_dealbreakers": [db_pref.dealbreakers_text] if db_pref.dealbreakers_text else [],
            "confirmed_no_match_over_wrong_match": db_pref.no_match_confirmed
        }

nis_tariq = map_db_user_to_user_profile(get_user_dict(tariq))
nis_pref_tariq = map_db_preference_to_match_preference(get_pref_dict(tariq))

candidate_dict = {
    "candidate_id": aisha.id,
    "profile": get_user_dict(aisha)
}
nis_aisha = map_db_candidate_to_candidate_profile(candidate_dict)

print("HARD FILTER:")
hf = evaluate_hard_filters(nis_tariq, nis_aisha, nis_pref_tariq)
print(hf)

print("\nPSYCHOLOGY:")
psy = evaluate_psychology(nis_tariq, nis_aisha)
print(psy)

