import pytest
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile
from nis.models.user_profile import UserProfile
from nis.services.nis_matchmaking_service import NISMatchmakingService

def get_base_20_input(is_verified=True, gender="FEMALE", safety="SAFE"):
    raw = {
        "age": 28, "gender": gender, "location": "London",
        "religious_practice_and_islamic_home": "PRACTICING", "marriage_readiness": "READY",
        "marital_status": "NEVER_MARRIED", "education_occupation": "BACHELORS",
        "pref_age_range": {"min": 25, "max": 35}, "pref_location": ["London"],
        "strict_dealbreakers": ["SMOKING"], "conflict_repair": "HEALTHY", "boundary_emotional_safety": "SAFE",
        "communication_style": "CALM", "lifestyle_finances": "THRIFTY", "family_wali_involvement": "EARLY"
    }
    kyc = SystemKycData(user_id="seeker_1", is_verified=is_verified, verified_gender=gender, verified_age=28, safety_status=safety, is_banned=False)
    return TwentyQuestionInput(raw, kyc)

def get_base_candidate(user_id="cand_1", gender="MALE", safety="SAFE", is_banned=False, dealbreaker_traits=None):
    db_traits = dealbreaker_traits or []
    prof = UserProfile(
        user_id=user_id, name="Cand", age=30, gender=gender, location="London", tradition="SUNNI", height_cm=180,
        marital_status="NEVER_MARRIED", education_level="BACHELORS", occupation="BACHELORS", work_outlook="BACHELORS",
        # Exact matching preferences
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

def test_generate_from_twenty_inputs_works():
    inp = get_base_20_input()
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [get_base_candidate()])
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_old_flow_still_works():
    from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
    u_prof, m_pref = TwentyInputProfileBuilder.build_profiles(get_base_20_input())
    res = NISMatchmakingService.generate_considered_few(u_prof, m_pref, [get_base_candidate()])
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_kyc_gate_blocks_unverified_seeker():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(is_verified=False), [get_base_candidate()])
    assert res["status"] == "SEEKER_NOT_KYC_VERIFIED"

def test_same_gender_candidate_blocked():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(gender="FEMALE"), [get_base_candidate(gender="FEMALE")])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_missing_seeker_gender_blocks_safely():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(gender="UNKNOWN"), [get_base_candidate(gender="MALE")])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_banned_candidate_blocked():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [get_base_candidate(is_banned=True)])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_unsafe_candidate_blocked():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [get_base_candidate(safety="BLOCKED")])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_dealbreaker_candidate_blocked():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [get_base_candidate(dealbreaker_traits=["SMOKING"])])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_dangerous_psychology_candidate_blocked():
    inp = get_base_20_input()
    inp.boundary_emotional_safety.answer_value = "LOW" # Seeker has low boundaries
    cand = get_base_candidate()
    cand.profile.manipulation_risk = "HIGH"
    cand.profile.gaslighting_risk = "HIGH"
    cand.profile.boundary_respect = "LOW" # Candidate disrespects boundaries
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [cand])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_safe_candidate_returned():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [get_base_candidate()])
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_public_response_privacy():
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [get_base_candidate()])
    c = res["candidates"][0]
    assert "_private_score" not in c
    assert "internal_score" not in c
    assert "match_percentage" not in c
    assert "rank" not in c
    assert "gaslighting_risk" not in c

def test_unknown_optional_20_input_values_do_not_crash():
    inp = get_base_20_input()
    inp.boundary_emotional_safety.answer_code = "UNKNOWN_WEIRD"
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [get_base_candidate()])
    assert res["status"] in ["HAS_CONSIDERED_CANDIDATES", "NO_SUITABLE_MATCHES_RIGHT_NOW"]
