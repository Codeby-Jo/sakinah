from nis.models.user_profile import UserProfile
from nis.models.candidate_profile import CandidateProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.adapters.db_to_nis_mapper import map_db_preference_to_match_preference
import json

FORBIDDEN_TERMS = [
    "controlling", "oppressive", "gaslighting", "manipulative", "dangerous",
    "toxic", "abusive", "vulnerable", "low empathy", "low boundary",
    "failed psychology", "psychology score", "compatibility percentage",
    "perfect match", "best match", "you should marry"
]

def create_base_user(user_id="1") -> UserProfile:
    return UserProfile(
        user_id=user_id, name="Test", age=25, gender="MALE", location="City", tradition="SUNNI",
        height_cm=180, marital_status="SINGLE", education_level="BS", occupation="Eng",
        work_outlook="Good", religious_practice_level="HIGH", islamic_environment_preference="HIGH",
        is_verified=True, is_banned=False, has_required_data=True, marriage_readiness="READY",
        emotional_steadiness="HIGH", anger_level="LOW", repair_style="GOOD", communication_style="OPEN",
        attachment_style="SECURE", family_involvement="LOW", family_pressure_level="LOW",
        boundary_strength="HIGH", financial_responsibility="HIGH", lifestyle_pattern="GOOD",
        safety_status="SAFE"
    )

def assert_no_forbidden_terms(response: dict):
    response_str = json.dumps(response).lower()
    for term in FORBIDDEN_TERMS:
        assert term not in response_str, f"Forbidden term '{term}' leaked in response!"

def test_successful_candidate_response_privacy():
    u1 = create_base_user(user_id="1")
    u1.gender = "FEMALE"
    u2 = create_base_user(user_id="2")
    c = CandidateProfile(candidate_id="2", profile=u2, known_dealbreaker_traits=[])
    pref = map_db_preference_to_match_preference({})
    
    res = NISMatchmakingService.generate_considered_few(u1, pref, [c])
    assert_no_forbidden_terms(res)

def test_no_match_response_privacy():
    u1 = create_base_user(user_id="1")
    u1.gender = "FEMALE"
    u2 = create_base_user(user_id="2")
    u2.gaslighting_risk = "HIGH"
    u2.boundary_respect = "LOW"
    u1.boundary_strength = "LOW"
    c = CandidateProfile(candidate_id="2", profile=u2, known_dealbreaker_traits=[])
    pref = map_db_preference_to_match_preference({})
    
    res = NISMatchmakingService.generate_considered_few(u1, pref, [c])
    assert res["status"] in ["NO_SUITABLE_MATCHES_RIGHT_NOW", "NO_PSYCHOLOGICALLY_SUITABLE_CANDIDATES"]
    assert_no_forbidden_terms(res)

def test_active_cap_response_privacy():
    u1 = create_base_user(user_id="1")
    u1.gender = "FEMALE"
    pref = map_db_preference_to_match_preference({})
    context = CandidatePoolContext(
        seeker_id="1",
        active_conversations_count=5, max_active_conversations=3,
        shown_candidate_ids=[], passed_candidate_ids=[], blocked_candidate_ids=[], active_conversation_candidate_ids=[]
    )
    res = NISMatchmakingService.generate_considered_few(u1, pref, [], pool_context=context)
    assert res["status"] == "ACTIVE_CONVERSATION_LIMIT_REACHED"
    assert_no_forbidden_terms(res)

def test_kyc_not_verified_privacy():
    u1 = create_base_user(user_id="1")
    u1.is_verified = False
    pref = map_db_preference_to_match_preference({})
    res = NISMatchmakingService.generate_considered_few(u1, pref, [])
    assert res["status"] == "SEEKER_NOT_KYC_VERIFIED"
    assert_no_forbidden_terms(res)

def test_safe_summary_does_not_expose_raw_fields():
    u1 = create_base_user(user_id="1")
    u1.gender = "FEMALE"
    u2 = create_base_user(user_id="2")
    c = CandidateProfile(candidate_id="2", profile=u2, known_dealbreaker_traits=[])
    pref = map_db_preference_to_match_preference({})
    
    res = NISMatchmakingService.generate_considered_few(u1, pref, [c])
    cand = res["candidates"][0]
    
    raw_fields = ["control_tendency", "gaslighting_risk", "manipulation_risk", "possessiveness_level"]
    cand_str = json.dumps(cand).lower()
    for f in raw_fields:
        assert f not in cand_str, f"Raw psychology field {f} leaked in candidate summary!"

def test_no_score_or_percentage_appears():
    u1 = create_base_user(user_id="1")
    u1.gender = "FEMALE"
    u2 = create_base_user(user_id="2")
    c = CandidateProfile(candidate_id="2", profile=u2, known_dealbreaker_traits=[])
    pref = map_db_preference_to_match_preference({})
    
    res = NISMatchmakingService.generate_considered_few(u1, pref, [c])
    res_str = json.dumps(res).lower()
    
    assert "score" not in res_str
    assert "percentage" not in res_str
    assert "%" not in res_str
