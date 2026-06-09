import pytest
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import get_mock_user, get_match_preference, get_candidate_pool_for_seeker

def test_passed_candidate_is_not_shown():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # We first run without context to see who gets shown
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res1["status"] == "HAS_CONSIDERED_CANDIDATES"
    shown_id = res1["candidates"][0]["candidate_id"]
    
    # Now run with context excluding them
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, passed_candidate_ids=[shown_id])
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    if res2["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in res2["candidates"]:
            assert c["candidate_id"] != shown_id

def test_shown_candidate_is_not_shown_again():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    shown_id = res1["candidates"][0]["candidate_id"]
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, shown_candidate_ids=[shown_id])
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    if res2["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in res2["candidates"]:
            assert c["candidate_id"] != shown_id

def test_blocked_candidate_is_not_shown():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    shown_id = res1["candidates"][0]["candidate_id"]
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, blocked_candidate_ids=[shown_id])
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    if res2["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in res2["candidates"]:
            assert c["candidate_id"] != shown_id

def test_active_conversation_candidate_is_not_shown():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    shown_id = res1["candidates"][0]["candidate_id"]
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, active_conversation_candidate_ids=[shown_id])
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    if res2["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in res2["candidates"]:
            assert c["candidate_id"] != shown_id

def test_nis_still_works_when_pool_context_is_none():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=None)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) > 0
    assert len(res["candidates"]) <= 5  # default is 5

def test_max_considered_is_respected_from_context():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, max_considered_candidates=2)
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) <= 2
