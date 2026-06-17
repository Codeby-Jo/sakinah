import pytest
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile
from nis.models.user_profile import UserProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService

FORBIDDEN_KEYS = [
    "_private_score", "internal_score", "match_percentage", "rank", "candidate_rank",
    "score_breakdown", "dealbreaker_reason", "psychology_block_reason",
    "dangerous_pairing_reason", "candidate_failure_reason", "reason_category",
    "gaslighting_risk", "manipulation_risk", "control_tendency", "religious_control_risk",
    "financial_control_tendency", "vulnerability_label", "same_gender_reason", "gender_filter_reason"
]

def assert_no_private_fields(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key in FORBIDDEN_KEYS:
                raise AssertionError(f"FORBIDDEN KEY EXPOSED: '{key}' found in response.")
            # Verify we are not leaking raw objects by accident
            if hasattr(value, "__dict__"):
                raise AssertionError(f"RAW OBJECT EXPOSED: '{key}' contains a raw object {type(value)} instead of a primitive/dict.")
            assert_no_private_fields(value)
    elif isinstance(obj, list):
        for item in obj:
            assert_no_private_fields(item)

def get_base_20_input():
    raw = {
        "age": 28, "gender": "FEMALE", "location": "London",
        "religious_practice_and_islamic_home": "PRACTICING", "marriage_readiness": "READY",
        "marital_status": "NEVER_MARRIED", "education_occupation": "BACHELORS",
        "pref_age_range": {"min": 25, "max": 35}, "pref_location": ["London"],
        "strict_dealbreakers": ["SMOKING"], "conflict_repair": "HEALTHY", "boundary_emotional_safety": "SAFE",
        "communication_style": "CALM", "lifestyle_finances": "THRIFTY", "family_wali_involvement": "EARLY"
    }
    kyc = SystemKycData(user_id="seeker_1", is_verified=True, verified_gender="FEMALE", verified_age=28, safety_status="SAFE", is_banned=False)
    return TwentyQuestionInput(raw, kyc)

def get_safe_candidate(user_id="cand_1", gender="MALE", safety="SAFE", is_banned=False, dealbreaker_traits=None):
    db_traits = dealbreaker_traits or []
    prof = UserProfile(
        user_id=user_id, name="Cand", age=30, gender=gender, location="London", tradition="SUNNI", height_cm=180,
        marital_status="NEVER_MARRIED", education_level="BACHELORS", occupation="BACHELORS", work_outlook="BACHELORS",
        religious_practice_level="FLEXIBLE", islamic_environment_preference="FLEXIBLE",
        is_verified=True, is_banned=is_banned, has_required_data=True, safety_status=safety, private_notes=None,
        marriage_readiness="READY", emotional_steadiness="STEADY", anger_level="UNKNOWN", repair_style="HEALTHY",
        communication_style="CALM", attachment_style="SECURE", family_involvement="EARLY", family_pressure_level="INDEPENDENT",
        boundary_strength="UNKNOWN", financial_responsibility="UNKNOWN", lifestyle_pattern="THRIFTY",
        control_tendency="UNKNOWN", empathy_level="HIGH", accountability_level="HIGH", humility_level="HIGH", boundary_respect="HIGH",
        manipulation_risk="LOW", silent_treatment_pattern="LOW", gaslighting_risk="LOW", financial_control_tendency="LOW",
        family_pressure_misuse_risk="LOW", religious_control_risk="LOW", possessiveness_level="LOW", isolation_tendency="LOW",
        decision_fairness="HIGH", softness_level="HIGH", assertiveness_level="HIGH", conflict_aggression_level="LOW", emotional_maturity="HIGH"
    )
    return CandidateProfile(candidate_id=user_id, profile=prof, known_dealbreaker_traits=db_traits)

def test_batch_1_response_has_no_private_fields():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(15)]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert res["meta"]["privacy_safe"] is True
    assert_no_private_fields(res)

def test_batch_2_response_has_no_private_fields():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(15)]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert res["meta"]["privacy_safe"] is True
    assert_no_private_fields(res)

def test_no_match_response_exposes_no_private_reason():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert res["meta"]["privacy_safe"] is True
    assert_no_private_fields(res)

def test_no_more_candidates_exposes_no_private_reason():
    candidates = [get_safe_candidate()]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    assert res["status"] == "NO_MORE_CANDIDATES_IN_THIS_BATCH"
    assert res["meta"]["privacy_safe"] is True
    assert_no_private_fields(res)

def test_same_gender_blocked_candidate_does_not_leak_reason():
    # Female seeker, Female cand
    cand = get_safe_candidate("cand_f", gender="FEMALE")
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [cand])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert_no_private_fields(res)

def test_dealbreaker_blocked_candidate_does_not_leak_reason():
    cand = get_safe_candidate("cand_s", dealbreaker_traits=["SMOKING"])
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [cand])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert_no_private_fields(res)

def test_psychology_blocked_candidate_does_not_leak_reason():
    cand = get_safe_candidate("cand_psy")
    cand.profile.manipulation_risk = "HIGH"
    cand.profile.gaslighting_risk = "HIGH"
    
    inp = get_base_20_input()
    inp.boundary_emotional_safety.answer_value = "LOW"
    cand.profile.boundary_respect = "LOW"
    
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [cand])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert_no_private_fields(res)

def test_old_direct_flow_respects_privacy():
    from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
    u_prof, m_pref = TwentyInputProfileBuilder.build_profiles(get_base_20_input())
    candidates = [get_safe_candidate()]
    
    res = NISMatchmakingService.generate_considered_few(u_prof, m_pref, candidates)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert res["meta"]["privacy_safe"] is True
    assert_no_private_fields(res)
