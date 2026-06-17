import pytest
import concurrent.futures
import copy
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_profile import CandidateProfile
from nis.models.user_profile import UserProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from tests.test_20_input_batch_privacy_contract import assert_no_private_fields, FORBIDDEN_KEYS

def get_base_20_input(seeker_id="seeker_1", boundary_val="SAFE"):
    raw = {
        "age": 28, "gender": "FEMALE", "location": "London",
        "religious_practice_and_islamic_home": "PRACTICING", "marriage_readiness": "READY",
        "marital_status": "NEVER_MARRIED", "education_occupation": "BACHELORS",
        "pref_age_range": {"min": 25, "max": 35}, "pref_location": ["London"],
        "strict_dealbreakers": ["SMOKING"], "conflict_repair": "HEALTHY", "boundary_safety": boundary_val,
        "communication_style": "CALM", "lifestyle_finances": "THRIFTY", "family_wali_involvement": "EARLY"
    }
    kyc = SystemKycData(user_id=seeker_id, is_verified=True, verified_gender="FEMALE", verified_age=28, safety_status="SAFE", is_banned=False)
    return TwentyQuestionInput(raw, kyc)

def get_safe_candidate(user_id="cand_1", gender="MALE"):
    prof = UserProfile(
        user_id=user_id, name="Cand", age=30, gender=gender, location="London", tradition="SUNNI", height_cm=180,
        marital_status="NEVER_MARRIED", education_level="BACHELORS", occupation="BACHELORS", work_outlook="BACHELORS",
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

# Create a shared global pool of 100 candidates
SHARED_CANDIDATES = [get_safe_candidate(user_id=f"cand_{i}") for i in range(100)]

def simulate_request(req_id):
    # 50 unique requests, each varying batch contexts and exclusions
    seeker_id = f"seeker_{req_id}"
    batch_num = (req_id % 3) + 1  # varies 1 to 3
    
    # Each request blocks different candidates to prove isolation
    blocked = [f"cand_{req_id}"]
    passed = [f"cand_{req_id + 1}"]
    shown = [f"cand_{req_id + 2}"]
    active = [f"cand_{req_id + 3}"]
    
    ctx = CandidatePoolContext(
        seeker_id=seeker_id,
        batch_number=batch_num,
        batch_size=10,
        blocked_candidate_ids=blocked,
        passed_candidate_ids=passed,
        shown_candidate_ids=shown,
        active_conversation_candidate_ids=active
    )
    
    inp = get_base_20_input(seeker_id=seeker_id)
    
    # Execute against the globally shared candidate list without deep copying here
    # to prove NIS does not mutate it.
    res = NISMatchmakingService.generate_matches_from_twenty_inputs(inp, SHARED_CANDIDATES, ctx)
    
    return req_id, batch_num, blocked, passed, shown, active, res

def test_stateless_concurrent_requests():
    results = []
    
    # 1. 50 simulated matchmaking requests complete without crashing using a ThreadPool
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(simulate_request, i) for i in range(50)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
            
    assert len(results) == 50
    
    for req_id, batch_num, blocked, passed, shown, active, res in results:
        # 2. Each seeker receives a valid response.
        assert res["status"] in ["HAS_CONSIDERED_CANDIDATES", "NO_MORE_CANDIDATES_IN_THIS_BATCH"]
        
        if res["status"] == "HAS_CONSIDERED_CANDIDATES":
            # 11-15: Privacy checks
            assert res["meta"]["privacy_safe"] is True
            assert_no_private_fields(res)
            
            returned_ids = {c["candidate_id"] for c in res["candidates"]}
            
            # 5-8: shown, passed, blocked, active candidate isolation verified
            assert not any(b in returned_ids for b in blocked)
            assert not any(p in returned_ids for p in passed)
            assert not any(s in returned_ids for s in shown)
            assert not any(a in returned_ids for a in active)
            
            # 10. Batch context verified
            assert res["meta"]["batch"]["batch_number"] == batch_num
            
            # 3. Request isolation (Ensure no cross-leakage of batch numbers or sizes from other threads)
            assert res["meta"]["batch"]["batch_size"] == len(res["candidates"])

def test_candidate_mutation_safety():
    # 9. Shared candidate pool is not dangerously mutated.
    # 10. Candidate mutation safety verified.
    # We must assert that the original candidate objects in SHARED_CANDIDATES
    # do NOT have _private_score or any forbidden keys permanently injected into them.
    for cand in SHARED_CANDIDATES:
        # Check CandidateProfile root attributes
        cand_dict = cand.__dict__
        for k in FORBIDDEN_KEYS:
            assert k not in cand_dict, f"Mutation leak: {k} found in CandidateProfile root!"
            
        # Check inner UserProfile attributes
        prof_dict = cand.profile.__dict__
        for k in FORBIDDEN_KEYS:
            # Some fields like manipulation_risk ARE supposed to be in the internal profile model!
            # But transient fields like _private_score or rank should never be there.
            if k in ["_private_score", "internal_score", "rank", "match_percentage", "score_breakdown"]:
                assert k not in prof_dict, f"Mutation leak: {k} found in inner UserProfile!"
        
        # Check dictionary if it was added as an ad-hoc attribute
        assert not hasattr(cand, "_private_score")
        assert not hasattr(cand.profile, "_private_score")
