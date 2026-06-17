import pytest
import time
import random
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile
from nis.models.user_profile import UserProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from tests.test_20_input_batch_privacy_contract import assert_no_private_fields

def get_base_20_input():
    raw = {
        "age": 28, "gender": "FEMALE", "location": "London",
        "religious_practice_and_islamic_home": "PRACTICING", "marriage_readiness": "READY",
        "marital_status": "NEVER_MARRIED", "education_occupation": "BACHELORS",
        "pref_age_range": {"min": 25, "max": 35}, "pref_location": ["London"],
        "strict_dealbreakers": ["SMOKING"], "conflict_repair": "HEALTHY", "boundary_emotional_safety": "SAFE",
        "communication_style": "CALM", "lifestyle_finances": "THRIFTY", "family_wali_involvement": "EARLY"
    }
    # Important: Seeker is FEMALE, so all FEMALE candidates must be blocked (same-gender exclusion).
    # Boundary safety is LOW for psychology triggering below.
    kyc = SystemKycData(user_id="seeker_1", is_verified=True, verified_gender="FEMALE", verified_age=28, safety_status="SAFE", is_banned=False)
    inp = TwentyQuestionInput(raw, kyc)
    inp.boundary_emotional_safety.answer_value = "LOW"
    return inp

def create_diverse_candidate(user_id):
    # Base Safe
    gender = "MALE"
    safety = "SAFE"
    is_banned = False
    is_verified = True
    db_traits = []
    
    # Psychology specific
    manipulation = "LOW"
    gaslighting = "LOW"
    boundary_respect = "HIGH"
    
    # Introduce random mix (approximate distributions)
    rand_val = random.random()
    
    if rand_val < 0.1: # 10% Same-gender
        gender = "FEMALE"
    elif rand_val < 0.2: # 10% Unsafe
        safety = "BLOCKED"
    elif rand_val < 0.3: # 10% Banned
        is_banned = True
    elif rand_val < 0.4: # 10% Unverified
        is_verified = False
    elif rand_val < 0.5: # 10% Dealbreaker
        db_traits = ["SMOKING"]
    elif rand_val < 0.6: # 10% Psychologically Dangerous (Rule 4)
        manipulation = "HIGH"
        gaslighting = "HIGH"
        boundary_respect = "LOW"
        
    prof = UserProfile(
        user_id=user_id, name="Cand", age=random.randint(25, 35), gender=gender, location="London", tradition="SUNNI", height_cm=180,
        marital_status="NEVER_MARRIED", education_level="BACHELORS", occupation="BACHELORS", work_outlook="BACHELORS",
        religious_practice_level="FLEXIBLE", islamic_environment_preference="FLEXIBLE",
        is_verified=is_verified, is_banned=is_banned, has_required_data=True, safety_status=safety, private_notes=None,
        marriage_readiness="READY", emotional_steadiness="STEADY", anger_level="UNKNOWN", repair_style="HEALTHY",
        communication_style="CALM", attachment_style="SECURE", family_involvement="EARLY", family_pressure_level="INDEPENDENT",
        boundary_strength="UNKNOWN", financial_responsibility="UNKNOWN", lifestyle_pattern="THRIFTY",
        control_tendency="UNKNOWN", empathy_level="HIGH", accountability_level="HIGH", humility_level="HIGH", boundary_respect=boundary_respect,
        manipulation_risk=manipulation, silent_treatment_pattern="LOW", gaslighting_risk=gaslighting, financial_control_tendency="LOW",
        family_pressure_misuse_risk="LOW", religious_control_risk="LOW", possessiveness_level="LOW", isolation_tendency="LOW",
        decision_fairness="HIGH", softness_level="HIGH", assertiveness_level="HIGH", conflict_aggression_level="LOW", emotional_maturity="HIGH"
    )
    return CandidateProfile(candidate_id=user_id, profile=prof, known_dealbreaker_traits=db_traits)

def test_nis_can_handle_5000_candidates_safely():
    # 1. Generate 5000 mock candidates
    # To ensure deterministic behavior for exclusion tests, we'll plant specific seeds or rely on the distribution.
    # The distribution guarantees roughly 2000 safe candidates, and 3000 excluded candidates.
    random.seed(42)
    candidates = [create_diverse_candidate(f"cand_{i}") for i in range(5000)]
    
    seeker_input = get_base_20_input()
    
    # --- BATCH 1 TEST ---
    ctx_1 = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    
    start_time = time.time()
    res_1 = NISMatchmakingService.generate_matches_from_twenty_inputs(seeker_input, candidates, ctx_1)
    end_time = time.time()
    
    runtime = end_time - start_time
    
    # 17. Runtime is acceptable for local test (within 10 seconds locally)
    assert runtime < 10.0, f"Performance bottleneck: 5000 candidates took {runtime:.2f} seconds."
    
    # 2. Batch 1 returns maximum 10 candidates.
    assert res_1["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res_1["candidates"]) == 10
    
    # Verify exclusions and privacy
    assert_no_private_fields(res_1)
    
    # Exclusions
    for c in res_1["candidates"]:
        cand_obj = next(obj for obj in candidates if obj.candidate_id == c["candidate_id"])
        # 5. Same-gender excluded
        assert cand_obj.profile.gender == "MALE"
        # 6. Unsafe excluded
        assert cand_obj.profile.safety_status == "SAFE"
        # 7. Banned excluded
        assert cand_obj.profile.is_banned is False
        # 8. Unverified excluded
        assert cand_obj.profile.is_verified is True
        # 9. Dealbreaker excluded
        assert "SMOKING" not in cand_obj.known_dealbreaker_traits
        # 10. Psychologically dangerous excluded
        assert cand_obj.profile.manipulation_risk == "LOW"
    
    
    # --- BATCH 2 TEST ---
    ctx_2 = CandidatePoolContext(seeker_id="seeker_1", batch_number=2, batch_size=10)
    
    start_time = time.time()
    res_2 = NISMatchmakingService.generate_matches_from_twenty_inputs(seeker_input, candidates, ctx_2)
    end_time = time.time()
    
    # 3. Batch 2 returns maximum 10 candidates.
    assert res_2["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res_2["candidates"]) == 10
    
    assert_no_private_fields(res_2)
    
    # 4. Batch 1 and Batch 2 do not overlap.
    batch_1_ids = {c["candidate_id"] for c in res_1["candidates"]}
    batch_2_ids = {c["candidate_id"] for c in res_2["candidates"]}
    
    assert len(batch_1_ids.intersection(batch_2_ids)) == 0

def test_empty_or_invalid_pool_does_not_crash_performance():
    ctx = CandidatePoolContext(seeker_id="seeker_1", batch_number=1, batch_size=10)
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(get_base_20_input(), [], ctx)
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
