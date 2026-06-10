import pytest
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import get_mock_user, get_match_preference, get_candidate_pool_for_seeker

def test_default_behavior_returns_max_3_candidates():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # Run with default
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) <= 3

def test_context_max_5_returns_max_5_candidates():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, max_considered_candidates=5)
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) > 3
    assert len(res["candidates"]) <= 5

def test_context_max_20_capped_to_5():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, max_considered_candidates=20)
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) <= 5

def test_if_only_one_suitable_candidate_returns_one():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # We first find all suitable candidates
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, max_considered_candidates=5)
    res_all = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    assert res_all["status"] == "HAS_CONSIDERED_CANDIDATES"
    all_suitable_ids = [c["candidate_id"] for c in res_all["candidates"]]
    
    # Exclude all except the first one
    excluded_ids = all_suitable_ids[1:]
    
    ctx_exclude = CandidatePoolContext(
        seeker_id=seeker.user_id, 
        max_considered_candidates=5,
        passed_candidate_ids=excluded_ids
    )
    
    limited_pool = [c for c in pool if c.candidate_id in all_suitable_ids]
    
    res_one = NISMatchmakingService.generate_considered_few(seeker, pref, limited_pool, pool_context=ctx_exclude)
    assert res_one["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res_one["candidates"]) == 1
    assert res_one["candidates"][0]["candidate_id"] == all_suitable_ids[0]

def test_no_fake_candidates_added_to_fill_pool():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # Exclude all suitable candidates
    ctx_max = CandidatePoolContext(seeker_id=seeker.user_id, max_considered_candidates=5)
    res_all = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx_max)
    
    all_suitable_ids = [c["candidate_id"] for c in res_all["candidates"]]
    limited_pool = [c for c in pool if c.candidate_id in all_suitable_ids]
    
    ctx_exclude = CandidatePoolContext(
        seeker_id=seeker.user_id, 
        passed_candidate_ids=all_suitable_ids,
        max_considered_candidates=5
    )
    
    res_none = NISMatchmakingService.generate_considered_few(seeker, pref, limited_pool, pool_context=ctx_exclude)
    
    assert res_none["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert len(res_none["candidates"]) == 0

def test_excluded_candidates_are_not_counted_against_limit():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # Get 5 suitable candidates
    ctx_max = CandidatePoolContext(seeker_id=seeker.user_id, max_considered_candidates=5)
    res_all = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx_max)
    
    all_suitable_ids = [c["candidate_id"] for c in res_all["candidates"]]
    
    if len(all_suitable_ids) >= 4:
        # Exclude the first 3
        excluded_ids = all_suitable_ids[:3]
        
        ctx_test = CandidatePoolContext(
            seeker_id=seeker.user_id,
            passed_candidate_ids=excluded_ids,
            max_considered_candidates=3
        )
        
        res_test = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx_test)
        
        # It should still return up to 3 candidates, bypassing the excluded ones
        assert res_test["status"] == "HAS_CONSIDERED_CANDIDATES"
        assert len(res_test["candidates"]) > 0
        
        returned_ids = [c["candidate_id"] for c in res_test["candidates"]]
        
        # None of the excluded should be in returned
        for eid in excluded_ids:
            assert eid not in returned_ids

def test_safe_handling_of_negative_max_limit():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, max_considered_candidates=-5)
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    # Should safely cap to 1
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) == 1
