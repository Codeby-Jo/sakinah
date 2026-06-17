import pytest
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile
from nis.models.user_profile import UserProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService

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

def assert_clean_empty_match_response(res):
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert len(res["candidates"]) == 0
    assert "reason_category" not in res
    assert "message" in res
    assert "meta" in res

def assert_clean_no_more_candidates_response(res):
    assert res["status"] == "NO_MORE_CANDIDATES_IN_THIS_BATCH"
    assert len(res["candidates"]) == 0
    assert "reason_category" not in res
    assert "message" in res
    assert "meta" in res

def test_empty_candidate_pool_returns_no_match():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [])
    assert_clean_empty_match_response(res)

def test_all_unsafe_returns_no_match():
    candidates = [get_safe_candidate(safety="BLOCKED") for _ in range(3)]
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates)
    assert_clean_empty_match_response(res)

def test_all_same_gender_returns_no_match():
    candidates = [get_safe_candidate(gender="FEMALE") for _ in range(3)]
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates)
    assert_clean_empty_match_response(res)

def test_mixed_pool_strips_same_gender_silently():
    # Seeker is FEMALE (from get_base_20_input)
    female_cand = get_safe_candidate(user_id="female_cand", gender="FEMALE")
    male_cand = get_safe_candidate(user_id="male_cand", gender="MALE")
    
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(
        get_base_20_input(), [female_cand, male_cand]
    )
    
    # 1. Same-gender candidates are internally blocked and stripped
    returned_ids = [c["candidate_id"] for c in res["candidates"]]
    assert "female_cand" not in returned_ids
    assert "male_cand" in returned_ids
    
    # 2. Public response does not reveal the same-gender rejection reason
    assert "reason_category" not in res
    for c in res["candidates"]:
        assert "dealbreaker_reason" not in c
        assert "reasons" not in c or not any("gender" in r.lower() for r in c["reasons"])

def test_all_banned_returns_no_match():
    candidates = [get_safe_candidate(is_banned=True) for _ in range(3)]
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates)
    assert_clean_empty_match_response(res)

def test_all_dealbreaker_returns_no_match():
    candidates = [get_safe_candidate(dealbreaker_traits=["SMOKING"]) for _ in range(3)]
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates)
    assert_clean_empty_match_response(res)

def test_all_dangerous_psychology_returns_no_match():
    cand = get_safe_candidate()
    cand.profile.manipulation_risk = "HIGH"
    cand.profile.gaslighting_risk = "HIGH"
    
    inp = get_base_20_input()
    # Trigger rule 4
    inp.boundary_emotional_safety.answer_value = "LOW"
    cand.profile.boundary_respect = "LOW"
    
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [cand])
    assert_clean_empty_match_response(res)

def test_batch_2_empty_returns_no_more():
    candidates = [get_safe_candidate()] # Only 1 candidate
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    assert_clean_no_more_candidates_response(res)

def test_batch_beyond_available_returns_no_more():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(15)]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=3, batch_size=10) # 21-30, none exist
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    assert_clean_no_more_candidates_response(res)

def test_no_match_response_hides_private_reasons():
    # Tested universally by assert_clean_empty_match_response checking that "reason_category" is absent.
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [])
    assert "dealbreaker_reason" not in res
    assert "psychology_block_reason" not in res
    assert "score_breakdown" not in res

def test_old_direct_flow_returns_safe_empty():
    from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
    u_prof, m_pref = TwentyInputProfileBuilder.build_profiles(get_base_20_input())
    res = NISMatchmakingService.generate_considered_few(u_prof, m_pref, [])
    assert_clean_empty_match_response(res)
