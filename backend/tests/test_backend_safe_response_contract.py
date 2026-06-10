import pytest
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import get_mock_user, get_match_preference, get_candidate_pool_for_seeker

def test_success_response_contract():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert "candidates" in res
    assert isinstance(res["candidates"], list)
    assert len(res["candidates"]) > 0
    
    assert "meta" in res
    assert res["meta"]["source"] == "NIS"
    assert res["meta"]["privacy_safe"] is True
    
    for c in res["candidates"]:
        assert "candidate_id" in c
        assert "status" in c
        assert "safe_summary" in c
        assert "_private_score" not in c
        
        summary = c["safe_summary"]
        assert "location" in summary
        assert "tradition" in summary
        assert "readiness" in summary
        assert "communication_note" in summary
        
        # Ensure no raw private fields
        assert "private_notes" not in summary
        assert "aadhaar" not in summary
        assert "government_id" not in summary

def test_no_match_response_contract():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = []
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert res["candidates"] == []
    assert "reason_category" in res
    assert "message" in res
    
    assert "meta" in res
    assert res["meta"]["source"] == "NIS"
    assert res["meta"]["privacy_safe"] is True

def test_active_limit_response_contract():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    ctx = CandidatePoolContext(seeker_id=seeker.user_id, active_conversations_count=10, max_active_conversations=5)
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool, pool_context=ctx)
    
    assert res["status"] == "ACTIVE_CONVERSATION_LIMIT_REACHED"
    assert res["candidates"] == []
    assert res["reason_category"] == "ACTIVE_CONVERSATION_LIMIT_REACHED"
    
    assert "meta" in res
    assert res["meta"]["source"] == "NIS"
    assert res["meta"]["privacy_safe"] is True

def test_no_score_or_percentage_exposed():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    output_str = str(res).lower()
    
    assert "score" not in output_str
    assert "percentage" not in output_str
    assert "perfect match" not in output_str
    assert "best match" not in output_str
    assert "marriage recommendation" not in output_str

def test_no_rejection_wording_exposed():
    seeker = get_mock_user("user_1")
    pref = get_match_preference("pref_2")
    pool = []
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    output_str = str(res).lower()
    
    assert "reject" not in output_str
    assert "decline" not in output_str
    assert "bad profile" not in output_str

def test_readme_contains_backend_safe_contract():
    with open("README.md", "r", encoding="utf-8") as f:
        content = f.read()
    
    assert "Backend-Safe NIS Response Contract" in content
    assert "meta" in content
    assert "privacy_safe" in content
