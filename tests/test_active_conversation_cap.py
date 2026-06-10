import pytest
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import get_mock_user, get_match_preference, get_candidate_pool_for_seeker

def test_active_conversations_zero_allows_generation():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(
        seeker_id=seeker.user_id,
        active_conversations_count=0,
        max_active_conversations=2
    )
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) > 0

def test_active_conversations_below_limit_allows_generation():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(
        seeker_id=seeker.user_id,
        active_conversations_count=1,
        max_active_conversations=2
    )
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_active_conversations_at_limit_blocks_generation():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(
        seeker_id=seeker.user_id,
        active_conversations_count=2,
        max_active_conversations=2
    )
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "ACTIVE_CONVERSATION_LIMIT_REACHED"
    assert len(res["candidates"]) == 0
    assert "rejection" not in res["message"].lower()

def test_active_conversations_above_limit_blocks_generation():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(
        seeker_id=seeker.user_id,
        active_conversations_count=3,
        max_active_conversations=2
    )
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    assert res["status"] == "ACTIVE_CONVERSATION_LIMIT_REACHED"
    assert len(res["candidates"]) == 0
    assert "rejection" not in res["message"].lower()

def test_old_behavior_works_when_context_is_none():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=None)
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(res["candidates"]) > 0
