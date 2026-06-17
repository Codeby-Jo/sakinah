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

def test_batch_1_returns_1_to_10():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(25)]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) == 10
    assert res["meta"]["batch"]["batch_number"] == 1
    assert res["meta"]["batch"]["has_next_batch"] is True

def test_batch_2_returns_11_to_20():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(25)]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) == 10
    assert res["meta"]["batch"]["batch_number"] == 2
    assert res["meta"]["batch"]["has_next_batch"] is True

def test_batch_2_does_not_repeat_batch_1():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(25)]
    
    ctx1 = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    res1 = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx1)
    
    ctx2 = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    res2 = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx2)
    
    batch_1_ids = {c["candidate_id"] for c in res1["candidates"]}
    batch_2_ids = {c["candidate_id"] for c in res2["candidates"]}
    
    # Assert no overlap
    assert len(batch_1_ids.intersection(batch_2_ids)) == 0

def test_already_shown_passed_blocked_active_not_repeated():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(5)]
    # All 5 candidates are in exclusion lists
    ctx = CandidatePoolContext(
        seeker_id="seeker_1",
        shown_candidate_ids=["cand_0"],
        passed_candidate_ids=["cand_1"],
        blocked_candidate_ids=["cand_2", "cand_3"],
        active_conversation_candidate_ids=["cand_4"],
        batch_number=1,
        batch_size=10
    )
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    assert res["status"] == "NO_ELIGIBLE_CANDIDATES" or res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert len(res["candidates"]) == 0

def test_unsafe_banned_same_gender_dealbreaker_never_returned():
    unsafe_cand = get_safe_candidate("unsafe", safety="BLOCKED")
    banned_cand = get_safe_candidate("banned", is_banned=True)
    female_cand = get_safe_candidate("female", gender="FEMALE")
    db_cand = get_safe_candidate("smoker", dealbreaker_traits=["SMOKING"])
    
    candidates = [unsafe_cand, banned_cand, female_cand, db_cand]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_if_batch_2_has_no_candidates_returns_no_more():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(5)] # Only 5 candidates exist
    # Requesting batch 2 (offset 10)
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    assert res["status"] == "NO_MORE_CANDIDATES_IN_THIS_BATCH"
    assert len(res["candidates"]) == 0

def test_invalid_batch_number_defaults_safely():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(5)]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=-5, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    # Should safely snap to batch 1
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert res["meta"]["batch"]["batch_number"] == 1

def test_requested_batch_size_above_10_is_capped():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(25)]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=100) # Try to get 100
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) == 10 # Capped to 10
    assert res["meta"]["max_candidates"] == 10

def test_public_response_hides_private_scores():
    candidates = [get_safe_candidate(user_id="cand_1")]
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx)
    
    c = res["candidates"][0]
    assert "_private_score" not in c
    assert "internal_score" not in c
    assert "match_percentage" not in c
    assert "rank" not in c
    assert "score_breakdown" not in c
    assert "dealbreaker_reason" not in c

def test_twenty_input_service_flow_works_with_batches():
    candidates = [get_safe_candidate(user_id=f"cand_{i}") for i in range(15)]
    
    # 20-input flow works with batch 1
    ctx1 = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    res1 = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx1)
    assert len(res1["candidates"]) == 10
    
    # 20-input flow works with batch 2
    ctx2 = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    res2 = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), candidates, ctx2)
    assert len(res2["candidates"]) == 5
