from nis.models.user_profile import UserProfile
from nis.models.candidate_profile import CandidateProfile
from nis.models.match_preference import MatchPreference
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.adapters.db_to_nis_mapper import map_db_preference_to_match_preference

def create_base_user(user_id="1", gender="MALE") -> UserProfile:
    return UserProfile(
        user_id=user_id, name="Test", age=25, gender=gender, location="City", tradition="SUNNI",
        height_cm=180, marital_status="SINGLE", education_level="BS", occupation="Eng",
        work_outlook="Good", religious_practice_level="HIGH", islamic_environment_preference="HIGH",
        is_verified=True, is_banned=False, has_required_data=True, marriage_readiness="READY",
        emotional_steadiness="HIGH", anger_level="LOW", repair_style="GOOD", communication_style="OPEN",
        attachment_style="SECURE", family_involvement="LOW", family_pressure_level="LOW",
        boundary_strength="HIGH", financial_responsibility="HIGH", lifestyle_pattern="GOOD",
        safety_status="SAFE"
    )

def test_dangerous_candidate_blocked():
    seeker = create_base_user(user_id="1", gender="FEMALE")
    seeker.softness_level = "HIGH"

    candidate_u = create_base_user(user_id="2", gender="MALE")
    candidate_u.control_tendency = "HIGH"
    candidate_u.empathy_level = "LOW"
    
    candidate = CandidateProfile(candidate_id="2", profile=candidate_u, known_dealbreaker_traits=[])
    
    pref = map_db_preference_to_match_preference({})
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, [candidate])
    # Should not appear because they are blocked by psychology rules
    assert res["status"] in ["NO_SUITABLE_MATCHES_RIGHT_NOW", "NO_PSYCHOLOGICALLY_SUITABLE_CANDIDATES"]
    assert len(res["candidates"]) == 0

def test_weak_compatibility_ranks_lower():
    seeker = create_base_user(user_id="1", gender="FEMALE")
    
    # Weak candidate
    c1_u = create_base_user(user_id="2", gender="MALE")
    c1_u.control_tendency = "MEDIUM"
    c1_u.empathy_level = "UNKNOWN"
    c1 = CandidateProfile(candidate_id="2", profile=c1_u, known_dealbreaker_traits=[])
    
    # Safe candidate
    c2_u = create_base_user(user_id="3", gender="MALE")
    c2_u.control_tendency = "LOW"
    c2_u.empathy_level = "HIGH"
    c2_u.accountability_level = "HIGH"
    c2 = CandidateProfile(candidate_id="3", profile=c2_u, known_dealbreaker_traits=[])
    
    pref = map_db_preference_to_match_preference({})
    res = NISMatchmakingService.generate_considered_few(seeker, pref, [c1, c2])
    
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) == 2
    # c2 (Safe) should rank higher than c1 (Weak)
    assert res["candidates"][0]["candidate_id"] == "3"
    assert res["candidates"][1]["candidate_id"] == "2"

def test_privacy_safe_response():
    seeker = create_base_user(user_id="1", gender="FEMALE")
    
    c_u = create_base_user(user_id="2", gender="MALE")
    c_u.control_tendency = "LOW"
    c = CandidateProfile(candidate_id="2", profile=c_u, known_dealbreaker_traits=[])
    
    pref = map_db_preference_to_match_preference({})
    res = NISMatchmakingService.generate_considered_few(seeker, pref, [c])
    
    c_out = res["candidates"][0]
    # Ensure no internal psychology labels are exposed
    assert "control_tendency" not in c_out["safe_summary"]
    assert "control_tendency" not in str(c_out)
    assert "score" not in str(c_out).lower()
    assert "percentage" not in str(c_out).lower()
