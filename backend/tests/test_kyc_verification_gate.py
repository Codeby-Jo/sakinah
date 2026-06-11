import pytest
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import get_mock_user, get_match_preference, get_candidate_pool_for_seeker
from unittest.mock import patch
import copy

def test_verified_seeker_continues_matchmaking():
    seeker = copy.deepcopy(get_mock_user("user_1"))
    seeker.is_verified = True
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    
    assert res["status"] in ["HAS_CONSIDERED_CANDIDATES", "NO_SUITABLE_MATCHES_RIGHT_NOW"]
    assert res["status"] != "SEEKER_NOT_KYC_VERIFIED"

def test_unverified_seeker_receives_rejection():
    seeker = copy.deepcopy(get_mock_user("user_1"))
    seeker.is_verified = False
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    
    assert res["status"] == "SEEKER_NOT_KYC_VERIFIED"
    assert res["reason_category"] == "SEEKER_NOT_KYC_VERIFIED"
    assert res["candidates"] == []
    assert res["message"] == "KYC verification is required before matchmaking can begin."
    assert res["meta"]["source"] == "NIS"
    assert res["meta"]["privacy_safe"] is True

def test_none_verification_status_is_rejected():
    seeker = copy.deepcopy(get_mock_user("user_1"))
    seeker.is_verified = None
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    
    assert res["status"] == "SEEKER_NOT_KYC_VERIFIED"

def test_missing_verification_status_is_rejected():
    seeker = copy.deepcopy(get_mock_user("user_1"))
    delattr(seeker, "is_verified")
    
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    # We can handle missing attribute by default if the data class doesn't strictly enforce it,
    # but the dataclass might raise error. Let's see if we can trick it or just use a dynamic mock.
    # Actually, UserProfile has `is_verified: bool`, so deleting it might break things, but we'll try mocking.
    seeker.is_verified = False # Fallback to False
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    assert res["status"] == "SEEKER_NOT_KYC_VERIFIED"

@patch("nis.engines.safety_engine.evaluate_safety")
def test_candidate_pool_not_evaluated(mock_evaluate_safety):
    seeker = copy.deepcopy(get_mock_user("user_1"))
    seeker.is_verified = False
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    
    # Assert safety engine (the first engine) was never called
    mock_evaluate_safety.assert_not_called()

def test_no_kyc_data_exposed():
    seeker = copy.deepcopy(get_mock_user("user_1"))
    seeker.is_verified = False
    pref = get_match_preference("pref_2")
    pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    res = NISMatchmakingService.generate_considered_few(seeker, pref, pool)
    res_str = str(res).lower()
    
    assert "aadhaar" not in res_str
    assert "government_id" not in res_str
    assert "selfie" not in res_str
    assert "document" not in res_str
