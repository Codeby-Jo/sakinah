import pytest
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import get_mock_user, get_match_preference, get_candidate_pool_for_seeker
import copy

def test_no_eligible_candidates():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = []  # Empty pool
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert res["reason_category"] == "NO_ELIGIBLE_CANDIDATES"

def test_active_conversation_limit():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(
        seeker_id=seeker.user_id,
        active_conversations_count=10,
        max_active_conversations=5
    )
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "ACTIVE_CONVERSATION_LIMIT_REACHED"
    assert res["reason_category"] == "ACTIVE_CONVERSATION_LIMIT_REACHED"

def test_strict_preferences():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_1") 
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # Make education strictly require MASTERS
    pref.education_is_strict = True
    pref.preferred_education_levels = ["MASTERS"]
    
    # modify pool to intentionally fail hard filters
    for c in pool:
        c.profile.education_level = "HIGH_SCHOOL"
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert res["reason_category"] == "STRICT_PREFERENCES_TOO_NARROW"

def test_safety_filtered_pool():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)[:3]
    
    for c in pool:
        c.profile.safety_status = "BLOCKED"
        
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert res["reason_category"] == "SAFETY_FILTERED_POOL"

def test_psychology_failure():
    seeker = get_mock_user("user_1")
    seeker.anger_level = "HIGH"
    
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)[:3]
    
    for c in pool:
        c.profile.anger_level = "HIGH"
        c.profile.safety_status = "CLEAR" # Pass safety
        c.profile.gender = "FEMALE" # Pass hard filter gender
        
    # All fail on psychology (High anger + high anger = BLOCKED)
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert res["reason_category"] == "NO_PSYCHOLOGICALLY_SUITABLE_CANDIDATES"

def test_no_private_details_in_no_match_response():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_1")
    pool = get_candidate_pool_for_seeker(seeker.user_id)[:1]
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    
    output_str = str(res).lower()
    assert "rejected" not in output_str
    assert "declined" not in output_str
    assert "bad profile" not in output_str
    assert pool[0].candidate_id.lower() not in output_str
