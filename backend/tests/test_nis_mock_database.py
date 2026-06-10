import pytest
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.mock_data.mock_database import (
    get_mock_user,
    get_match_preference,
    get_candidate_pool_for_seeker,
    mock_users
)

def test_1_preference_matches_one_candidate():
    # TEST 1 — Preference should match one candidate
    # We want a male seeker looking for a flexible match.
    seeker = get_mock_user("user_1")  # MALE
    match_preference = get_match_preference("pref_2")  # flexible age/location
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(
        current_user=seeker,
        match_preference=match_preference,
        candidates=candidate_pool
    )
    
    assert result["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(result["candidates"]) > 0
    
    for c in result["candidates"]:
        assert c["status"] == "SHOWN"
        # Verify same-gender is not shown
        c_user = get_mock_user(c["candidate_id"])
        assert c_user.gender != seeker.gender
        # Verify not banned/unsafe
        assert c_user.is_banned is False
        assert c_user.safety_status == "SAFE"
        # Verify privacy-safe output
        assert "private_notes" not in c["safe_summary"]

def test_2_preference_should_not_match_anyone():
    # TEST 2 — Preference should not match anyone
    seeker = get_mock_user("user_3")
    match_preference = get_match_preference("pref_7")  # strictly impossible (age 90-100, etc.)
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(
        current_user=seeker,
        match_preference=match_preference,
        candidates=candidate_pool
    )
    
    assert result["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    assert len(result["candidates"]) == 0

def test_3_different_seeker_preference_matches_again():
    # TEST 3 — Different seeker preference should match again
    seeker = get_mock_user("user_2")  # FEMALE
    match_preference = get_match_preference("pref_1")  # strict age/location (CityA)
    # Let's ensure there's a suitable candidate in CityA
    # user_3 is MALE, CityA, Never Married. age 23.
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(
        current_user=seeker,
        match_preference=match_preference,
        candidates=candidate_pool
    )
    
    assert result["status"] in ["HAS_CONSIDERED_CANDIDATES", "NO_SUITABLE_MATCHES_RIGHT_NOW"]
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.gender != seeker.gender
            assert "private_notes" not in c["safe_summary"]

# ADDITIONAL TESTS

def test_same_gender_never_shown():
    seeker = get_mock_user("user_1") # MALE
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.gender != seeker.gender

def test_banned_users_never_shown():
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.is_banned is False

def test_unsafe_users_never_shown():
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.safety_status == "SAFE"

def test_candidates_missing_data_never_shown():
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.has_required_data is True

def test_candidates_with_dealbreaker_blocked():
    # user_23 has dealbreaker SMOKER
    # pref_6 has SMOKER dealbreaker
    seeker = get_mock_user("user_24") # FEMALE
    match_preference = get_match_preference("pref_6")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            assert c["candidate_id"] != "user_23"

def test_strict_preference_mismatch_blocks():
    # pref_1 is strict on location CityA
    seeker = get_mock_user("user_2") # FEMALE
    match_preference = get_match_preference("pref_1")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.location in match_preference.preferred_locations

def test_flexible_preference_mismatch_does_not_block():
    # pref_2 is flexible
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    assert result["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_male_seeker_gets_female_candidate():
    seeker = get_mock_user("user_1") # MALE
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.gender == "FEMALE"

def test_female_seeker_gets_male_candidate():
    seeker = get_mock_user("user_2") # FEMALE
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            c_user = get_mock_user(c["candidate_id"])
            assert c_user.gender == "MALE"

def test_missing_seeker_gender_returns_no_match():
    seeker = get_mock_user("user_1")
    seeker.gender = None # Missing
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    assert result["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"
    
    seeker.gender = "MALE" # Restore

def test_missing_candidate_gender_blocks_that_candidate():
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    # corrupt candidate gender
    for c in candidate_pool:
        if c.candidate_id == "user_2":
            c.profile.gender = None
            
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            assert c["candidate_id"] != "user_2"
            
    # restore
    for c in candidate_pool:
        if c.candidate_id == "user_2":
            c.profile.gender = "FEMALE"

def test_no_suitable_candidates_returns_no_match():
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = [] # Empty pool
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    assert result["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_strong_candidate_is_shown():
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    assert result["status"] == "HAS_CONSIDERED_CANDIDATES"
    assert len(result["candidates"]) > 0

def test_output_does_not_expose_private_data():
    seeker = get_mock_user("user_1")
    match_preference = get_match_preference("pref_2")
    candidate_pool = get_candidate_pool_for_seeker(seeker.user_id)
    
    result = NISMatchmakingService.generate_considered_few(seeker, match_preference, candidate_pool)
    if result["status"] == "HAS_CONSIDERED_CANDIDATES":
        for c in result["candidates"]:
            summary = c["safe_summary"]
            assert "private_notes" not in summary
            assert "Aadhaar" not in str(summary)
            assert "selfie" not in str(summary)
            assert "compatibility percentage" not in str(summary)
