import pytest
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile
from nis.models.user_profile import UserProfile
from nis.services.nis_matchmaking_service import NISMatchmakingService

def get_base_20_input():
    raw = {
        "age": 28, "gender": "FEMALE", "location": "London",
        "religious_practice_and_islamic_home": "PRACTICING", "marriage_readiness": "READY",
        "marital_status": "NEVER_MARRIED", "education_occupation": "BACHELORS",
        "pref_age_range": {"min": 25, "max": 35}, "pref_location": ["London"],
        "strict_dealbreakers": ["SMOKING"], "conflict_repair": "HEALTHY", "boundary_emotional_safety": "SAFE",
        "communication_style": "CALM", "lifestyle_finances": "THRIFTY", "family_wali_involvement": "EARLY",
        "pref_marital_status": "NO_STRICT_PREFERENCE",
        "pref_height_or_physical_preference": "NO_STRICT_HEIGHT_PREFERENCE"
    }
    kyc = SystemKycData(user_id="seeker_1", is_verified=True, verified_gender="FEMALE", verified_age=28, safety_status="SAFE", is_banned=False)
    return TwentyQuestionInput(raw, kyc)

def get_safe_candidate(user_id="cand_1", gender="MALE", marital_status="NEVER_MARRIED", height=180):
    prof = UserProfile(
        user_id=user_id, name="Cand", age=30, gender=gender, location="London", tradition="SUNNI", height_cm=height,
        marital_status=marital_status, education_level="BACHELORS", occupation="BACHELORS", work_outlook="BACHELORS",
        religious_practice_level="FLEXIBLE", islamic_environment_preference="FLEXIBLE",
        is_verified=True, is_banned=False, has_required_data=True, safety_status="SAFE", private_notes=None,
        marriage_readiness="READY", emotional_steadiness="STEADY", anger_level="UNKNOWN", repair_style="HEALTHY",
        communication_style="CALM", attachment_style="SECURE", family_involvement="EARLY", family_pressure_level="INDEPENDENT",
        boundary_strength="UNKNOWN", financial_responsibility="UNKNOWN", lifestyle_pattern="THRIFTY",
        control_tendency="UNKNOWN", empathy_level="HIGH", accountability_level="HIGH", humility_level="HIGH", boundary_respect="HIGH",
        manipulation_risk="LOW", silent_treatment_pattern="LOW", gaslighting_risk="LOW", financial_control_tendency="LOW",
        family_pressure_misuse_risk="LOW", religious_control_risk="LOW", possessiveness_level="LOW", isolation_tendency="LOW",
        decision_fairness="HIGH", softness_level="HIGH", assertiveness_level="HIGH", conflict_aggression_level="LOW", emotional_maturity="HIGH"
    )
    return CandidateProfile(candidate_id=user_id, profile=prof, known_dealbreaker_traits=[])

def test_model_has_exactly_20_inputs():
    inp = get_base_20_input()
    # 1. TwentyQuestionInput still has max 20 inputs.
    # We can count the properties of the class that are InputField
    from nis.models.twenty_question_input import InputField
    count = sum(1 for v in inp.__dict__.values() if isinstance(v, InputField))
    assert count == 20

def test_preferred_marital_status_maps_correctly():
    inp = get_base_20_input()
    # 2. Preferred marital status exists.
    assert hasattr(inp, "pref_marital_status")
    
    from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
    u_prof, m_pref = TwentyInputProfileBuilder.build_profiles(inp)
    
    # 4. Preferred marital status maps into MatchPreference.
    assert m_pref.preferred_marital_statuses == []
    assert m_pref.marital_status_is_strict is False
    
    inp.pref_marital_status.answer_code = "NEVER_MARRIED"
    u_prof, m_pref = TwentyInputProfileBuilder.build_profiles(inp)
    assert m_pref.preferred_marital_statuses == ["NEVER_MARRIED"]
    assert m_pref.marital_status_is_strict is True

def test_preferred_height_maps_correctly():
    inp = get_base_20_input()
    # 3. Preferred height/physical preference exists.
    assert hasattr(inp, "pref_height_or_physical_preference")
    
    from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
    u_prof, m_pref = TwentyInputProfileBuilder.build_profiles(inp)
    
    # 5. Preferred height maps into MatchPreference.
    assert m_pref.preferred_min_height_cm is None
    assert m_pref.height_is_strict is False
    
    # Strict range
    inp.pref_height_or_physical_preference.answer_value = {"min": 170, "max": 190, "strict": True}
    u_prof, m_pref = TwentyInputProfileBuilder.build_profiles(inp)
    assert m_pref.preferred_min_height_cm == 170
    assert m_pref.preferred_max_height_cm == 190
    assert m_pref.height_is_strict is True

def test_strict_marital_status_blocks_candidates():
    # 6. Strict marital status preference blocks non-matching candidates.
    inp = get_base_20_input()
    inp.pref_marital_status.answer_code = "NEVER_MARRIED" # Strict
    
    cand_match = get_safe_candidate(user_id="c_match", marital_status="NEVER_MARRIED")
    cand_fail = get_safe_candidate(user_id="c_fail", marital_status="DIVORCED")
    
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [cand_match, cand_fail])
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    returned_ids = [c["candidate_id"] for c in res["candidates"]]
    assert "c_match" in returned_ids
    assert "c_fail" not in returned_ids

def test_strict_height_blocks_candidates():
    # 7. Strict height preference blocks candidates outside the range.
    inp = get_base_20_input()
    inp.pref_height_or_physical_preference.answer_value = {"min": 170, "max": 180, "strict": True}
    
    cand_match = get_safe_candidate(user_id="c_match", height=175)
    cand_fail = get_safe_candidate(user_id="c_fail", height=190)
    
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [cand_match, cand_fail])
    returned_ids = [c["candidate_id"] for c in res["candidates"]]
    assert "c_match" in returned_ids
    assert "c_fail" not in returned_ids

def test_flexible_height_does_not_block():
    # 8. Flexible height preference does not hard-block safe candidates.
    inp = get_base_20_input()
    inp.pref_height_or_physical_preference.answer_value = "PREFER_TALLER_THAN_ME" # This maps to height_is_strict = False internally via the signal engine
    
    cand_short = get_safe_candidate(user_id="c_short", height=150)
    cand_tall = get_safe_candidate(user_id="c_tall", height=190)
    
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [cand_short, cand_tall])
    returned_ids = [c["candidate_id"] for c in res["candidates"]]
    
    # Both pass because the hard_filter checks if it is strict. If not strict, they pass as SOFT_MISMATCH, which confidence engine promotes to SHOWN (with lower ranking score).
    assert "c_short" in returned_ids
    assert "c_tall" in returned_ids

def test_physical_preference_does_not_expose_toxic_fields():
    # 9. Physical preference does not expose beauty/rating/photo-score fields.
    inp = get_base_20_input()
    from nis.engines.twenty_input_signal_engine import TwentyInputSignalEngine
    signals = TwentyInputSignalEngine.derive_signals(inp)
    
    assert "beauty_score" not in signals
    assert "photo_rating" not in signals
    assert "body_score" not in signals
    
    # 10. Public response still hides score/rank/percentage/reasons.
    cand = get_safe_candidate()
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, [cand])
    for c in res["candidates"]:
        assert "_private_score" not in c
        assert "rank" not in c
        assert "reason_category" not in res
