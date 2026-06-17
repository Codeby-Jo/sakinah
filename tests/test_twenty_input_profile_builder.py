import pytest
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
from nis.models.user_profile import UserProfile
from nis.models.match_preference import MatchPreference

def get_base_input():
    raw_answers = {
        "age": 28,
        "gender": "FEMALE",
        "location": "London",
        "religious_practice_and_islamic_home": "PRACTICING",
        "marriage_readiness": "READY",
        "marital_status": "NEVER_MARRIED",
        "education_occupation": "BACHELORS",
        "pref_age_range": {"min": 28, "max": 35},
        "pref_location": ["London"],
        "family_wali_involvement": "EARLY",
        "marriage_timeline": "SOON",
        "strict_dealbreakers": ["SMOKING"],
        "communication_style": "CALM",
        "conflict_repair": "HEALTHY",
        "boundary_emotional_safety": "SAFE",
        "lifestyle_finances": "THRIFTY"
    }
    # Notice we simulate a scenario where the user tries to claim they are verified in the raw answers, 
    # but the KYC data from the system says otherwise.
    raw_answers["is_verified"] = True
    raw_answers["safety_status"] = "SAFE"
    
    kyc_data = SystemKycData(
        user_id="user_123",
        is_verified=False, # System overrides user
        safety_status="PENDING", # System overrides user
        is_banned=False
    )
    return TwentyQuestionInput(raw_answers, kyc_data)

def test_builder_creates_user_profile():
    model = get_base_input()
    user_prof, _ = TwentyInputProfileBuilder.build_profiles(model)
    assert isinstance(user_prof, UserProfile)
    assert user_prof.user_id == "user_123"

def test_builder_creates_match_preference():
    model = get_base_input()
    _, match_pref = TwentyInputProfileBuilder.build_profiles(model)
    assert isinstance(match_pref, MatchPreference)
    assert match_pref.preferred_min_age == 28
    assert match_pref.preferred_max_age == 35

def test_builder_uses_trusted_system_kyc_data():
    model = get_base_input()
    user_prof, _ = TwentyInputProfileBuilder.build_profiles(model)
    # The raw answers tried to set is_verified=True, but KYC data said False.
    assert user_prof.is_verified is False
    assert user_prof.safety_status == "PENDING"

def test_frontend_cannot_spoof_kyc():
    model = get_base_input()
    user_prof, _ = TwentyInputProfileBuilder.build_profiles(model)
    assert user_prof.is_verified is False
    assert user_prof.safety_status == "PENDING"

def test_missing_optional_values_do_not_crash_builder():
    raw_answers = {
        "age": 30,
        "gender": "MALE",
        "location": "NY",
        "religious_practice_and_islamic_home": "PRACTICING",
        "marriage_readiness": "READY"
    }
    kyc_data = SystemKycData(user_id="user_456")
    model = TwentyQuestionInput(raw_answers, kyc_data)
    
    user_prof, match_pref = TwentyInputProfileBuilder.build_profiles(model)
    assert user_prof.marital_status == "NEVER_MARRIED" # The safe default mapped
    assert match_pref.preferred_min_age == 18

def test_unknown_values_map_safely():
    raw_answers = {
        "age": 30,
        "gender": "MALE",
        "location": "NY",
        "religious_practice_and_islamic_home": "PRACTICING",
        "marriage_readiness": "READY",
        "conflict_repair": "WEIRD_UNKNOWN"
    }
    kyc_data = SystemKycData(user_id="user_456")
    model = TwentyQuestionInput(raw_answers, kyc_data)
    
    user_prof, _ = TwentyInputProfileBuilder.build_profiles(model)
    assert user_prof.anger_level == "WEIRD_UNKNOWN"
    assert user_prof.accountability_level == "UNKNOWN"

def test_built_objects_contain_expected_derived_signals():
    model = get_base_input()
    user_prof, match_pref = TwentyInputProfileBuilder.build_profiles(model)
    
    assert user_prof.anger_level == "HEALTHY"
    assert user_prof.manipulation_risk == "LOW"
    assert match_pref.dealbreakers == ["SMOKING"]
    assert match_pref.non_negotiables == ["SMOKING"]

def test_built_objects_can_be_passed_to_existing_engines():
    model = get_base_input()
    user_prof, match_pref = TwentyInputProfileBuilder.build_profiles(model)
    
    from nis.engines import preference_engine, hard_filter_engine, safety_engine
    from nis.models.candidate_profile import CandidateProfile
    
    # We create a dummy candidate to pass to the engine
    dummy_candidate = CandidateProfile(
        candidate_id="cand_1",
        profile=user_prof,
        known_dealbreaker_traits=[]
    )
    
    # If this raises type errors, the builder failed to satisfy the legacy models
    p_res = preference_engine.evaluate_preferences(dummy_candidate, match_pref)
    assert isinstance(p_res, dict)
    
    h_res = hard_filter_engine.evaluate_hard_filters(user_prof, dummy_candidate, match_pref)
    assert isinstance(h_res, dict)
    
    s_res = safety_engine.evaluate_safety(dummy_candidate)
    assert isinstance(s_res, dict)
