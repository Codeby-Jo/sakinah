import sys
import inspect
from nis.adapters.db_to_nis_mapper import (
    map_db_user_to_user_profile,
    map_db_candidate_to_candidate_profile,
    map_db_preference_to_match_preference
)
from nis.models.user_profile import UserProfile
from nis.models.candidate_profile import CandidateProfile
from nis.models.match_preference import MatchPreference

def test_db_user_maps_to_user_profile():
    db_user = {
        "user_id": "u1",
        "name": "Test User",
        "age": 25,
        "gender": "male",
        "location": "City",
        "tradition": "SUNNI",
        "marital_status": "NEVER_MARRIED",
        "height_cm": 175
    }
    profile = map_db_user_to_user_profile(db_user)
    assert isinstance(profile, UserProfile)
    assert profile.user_id == "u1"
    assert profile.name == "Test User"
    assert profile.age == 25
    assert profile.location == "City"
    assert profile.tradition == "SUNNI"
    assert profile.marital_status == "NEVER_MARRIED"
    assert profile.height_cm == 175

def test_db_candidate_maps_to_candidate_profile():
    db_candidate = {
        "candidate_id": "c1",
        "profile": {
            "user_id": "c1",
            "name": "Candidate 1",
            "gender": "female"
        },
        "known_dealbreaker_traits": ["SMOKER"]
    }
    candidate = map_db_candidate_to_candidate_profile(db_candidate)
    assert isinstance(candidate, CandidateProfile)
    assert candidate.candidate_id == "c1"
    assert candidate.profile.name == "Candidate 1"
    assert candidate.profile.gender == "FEMALE"
    assert candidate.known_dealbreaker_traits == ["SMOKER"]

def test_db_preference_maps_to_match_preference():
    db_pref = {
        "preferred_min_age": 20,
        "preferred_max_age": 30,
        "age_is_strict": True,
        "preferred_locations": ["CityA"]
    }
    pref = map_db_preference_to_match_preference(db_pref)
    assert isinstance(pref, MatchPreference)
    assert pref.preferred_min_age == 20
    assert pref.preferred_max_age == 30
    assert pref.age_is_strict is True
    assert pref.preferred_locations == ["CityA"]

def test_gender_is_normalized():
    profile1 = map_db_user_to_user_profile({"user_id": "1", "gender": "male"})
    profile2 = map_db_user_to_user_profile({"user_id": "2", "gender": "female"})
    profile3 = map_db_user_to_user_profile({"user_id": "3", "gender": "MALE"})
    
    assert profile1.gender == "MALE"
    assert profile2.gender == "FEMALE"
    assert profile3.gender == "MALE"

def test_missing_list_fields_become_empty_lists():
    db_pref = {}
    pref = map_db_preference_to_match_preference(db_pref)
    assert pref.preferred_marital_statuses == []
    assert pref.preferred_locations == []
    assert pref.preferred_education_levels == []
    assert pref.preferred_occupations == []
    assert pref.preferred_work_outlook == []
    assert pref.family_expectations == []
    assert pref.difficult_conflict_styles == []
    assert pref.important_character_traits == []
    assert pref.dealbreakers == []
    assert pref.non_negotiables == []
    assert pref.flexible_preferences == []
    assert pref.custom_dealbreakers == []
    assert pref.reportable_behaviors == []

def test_raw_kyc_private_fields_are_ignored():
    db_user = {
        "user_id": "kyc_user",
        "gender": "male",
        "aadhaar_number": "123456",
        "aadhaar": "data",
        "government_id": "ID",
        "passport_number": "P123",
        "pan_number": "PAN123",
        "selfie_url": "http://img",
        "liveness_image": "http://img2",
        "kyc_document": "doc",
        "raw_kyc_response": "{}",
        "face_match_image": "img3",
        "id_document_url": "url"
    }
    profile = map_db_user_to_user_profile(db_user)
    # Check that none of the KYC fields ended up in the UserProfile attributes
    attrs = dir(profile)
    assert "aadhaar_number" not in attrs
    assert "selfie_url" not in attrs
    assert "passport_number" not in attrs

def test_no_firebase_fastapi_db_imports():
    # Read the source code of the mapper to ensure no imports of firebase, fastapi, sqlalchemy etc.
    import nis.adapters.db_to_nis_mapper as mapper_module
    source = inspect.getsource(mapper_module)
    
    assert "firebase" not in source.lower()
    assert "fastapi" not in source.lower()
    assert "sqlalchemy" not in source.lower()
    assert "pymongo" not in source.lower()
