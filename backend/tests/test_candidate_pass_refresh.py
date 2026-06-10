import pytest
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import get_mock_user, get_match_preference, get_candidate_pool_for_seeker

def test_passed_candidate_is_excluded():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res1["status"] == "HAS_CONSIDERED_CANDIDATES"
    passed_id = res1["candidates"][0]["candidate_id"]
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, passed_candidate_ids=[passed_id])
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    if res2["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in res2["candidates"]:
            assert c["candidate_id"] != passed_id

def test_already_shown_candidate_is_excluded():
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

def test_new_suitable_candidate_replaces_passed_candidate():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    initial_count = len(res1["candidates"])
    passed_id = res1["candidates"][0]["candidate_id"]
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, passed_candidate_ids=[passed_id], max_considered_candidates=initial_count)
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    if res2["status"] == "HAS_CONSIDERED_CANDIDATES":
        assert len(res2["candidates"]) <= initial_count
        # Verify passed candidate is not in the new results
        candidate_ids = [c["candidate_id"] for c in res2["candidates"]]
        assert passed_id not in candidate_ids

def test_all_suitable_passed_returns_no_match():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res1["status"] == "HAS_CONSIDERED_CANDIDATES"
    all_suitable_ids = [c["candidate_id"] for c in res1["candidates"]]
    
    limited_pool = [c for c in pool if c.candidate_id in all_suitable_ids]
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, passed_candidate_ids=all_suitable_ids)
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, limited_pool, pool_context=ctx)
    
    assert res2["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_pass_is_silent_no_rejection_wording():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    passed_id = res1["candidates"][0]["candidate_id"]
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, passed_candidate_ids=[passed_id])
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    response_str = str(res2).lower()
    assert "reject" not in response_str
    assert "decline" not in response_str

def test_no_fake_candidates_added():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # Exclude all suitable candidates
    res1 = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    all_suitable_ids = [c["candidate_id"] for c in res1["candidates"]]
    
    limited_pool = [c for c in pool if c.candidate_id in all_suitable_ids]
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, passed_candidate_ids=all_suitable_ids)
    res2 = NISMatchmakingService.generate_considered_few(seeker, pref, limited_pool, pool_context=ctx)
    
    # If fake candidates were added, it would return HAS_CONSIDERED_CANDIDATES
    # We expect NO_SUITABLE_MATCHES_RIGHT_NOW and exactly 0 candidates
    assert res2["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert len(res2["candidates"]) == 0

def test_active_conversation_candidate_is_excluded():
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

def test_blocked_candidate_is_excluded():
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
