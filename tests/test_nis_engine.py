import pytest
import json
from copy import deepcopy

from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.engines.hard_filter_engine import evaluate_hard_filters
from nis.mock_data.mock_users import (
    current_user,
    match_preference,
    strong_candidate,
    age_mismatch_candidate,
    banned_candidate,
    unsafe_candidate,
    angry_weak_repair_candidate,
    dealbreaker_candidate,
    insufficient_data_candidate,
    weak_preference_candidate,
    male_candidate,
    female_candidate,
    missing_gender_candidate,
    same_gender_candidate,
    height_mismatch_candidate,
    flexible_height_mismatch_candidate,
    marital_status_mismatch_candidate,
    education_mismatch_candidate,
    occupation_mismatch_candidate,
    work_outlook_mismatch_candidate,
    religious_practice_mismatch_candidate,
    family_boundary_mismatch_candidate,
    candidates,
    create_base_profile,
    female_current_user,
    missing_gender_current_user
)
from nis.models.candidate_profile import CandidateProfile

def test_male_seeker_must_not_receive_male_candidate():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [male_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_female_seeker_must_not_receive_female_candidate():
    res = NISMatchmakingService.generate_considered_few(female_current_user, match_preference, [female_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_male_seeker_can_receive_eligible_female_candidate():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [female_candidate])
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_female_seeker_can_receive_eligible_male_candidate():
    res = NISMatchmakingService.generate_considered_few(female_current_user, match_preference, [male_candidate])
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_missing_seeker_gender_returns_no_match():
    res = NISMatchmakingService.generate_considered_few(missing_gender_current_user, match_preference, [female_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_missing_candidate_gender_blocks_candidate():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [missing_gender_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_strict_height_mismatch_blocks_candidate():
    pref = deepcopy(match_preference)
    pref.height_is_strict = True
    res = NISMatchmakingService.generate_considered_few(current_user, pref, [height_mismatch_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_flexible_height_mismatch_does_not_hard_block():
    pref = deepcopy(match_preference)
    pref.height_is_strict = False
    res = evaluate_hard_filters(current_user, flexible_height_mismatch_candidate, pref)
    assert res["status"] == "SOFT_MISMATCH"

def test_strict_marital_status_mismatch_blocks_candidate():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [marital_status_mismatch_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_flexible_marital_status_mismatch_does_not_hard_block():
    pref = deepcopy(match_preference)
    pref.marital_status_is_strict = False
    res = evaluate_hard_filters(current_user, marital_status_mismatch_candidate, pref)
    assert res["status"] == "SOFT_MISMATCH"

def test_strict_education_mismatch_blocks_candidate():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [education_mismatch_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_flexible_education_mismatch_does_not_hard_block():
    pref = deepcopy(match_preference)
    pref.education_is_strict = False
    res = evaluate_hard_filters(current_user, education_mismatch_candidate, pref)
    assert res["status"] == "SOFT_MISMATCH"

def test_strict_occupation_mismatch_blocks_candidate():
    pref = deepcopy(match_preference)
    pref.preferred_occupations = ["Engineer", "Doctor"]
    pref.occupation_is_strict = True
    res = NISMatchmakingService.generate_considered_few(current_user, pref, [occupation_mismatch_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_flexible_occupation_mismatch_does_not_hard_block():
    pref = deepcopy(match_preference)
    pref.preferred_occupations = ["Engineer", "Doctor"]
    pref.occupation_is_strict = False
    res = evaluate_hard_filters(current_user, occupation_mismatch_candidate, pref)
    assert res["status"] == "SOFT_MISMATCH"

def test_strict_work_outlook_mismatch_blocks_candidate():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [work_outlook_mismatch_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_flexible_work_outlook_mismatch_does_not_hard_block():
    pref = deepcopy(match_preference)
    pref.work_outlook_is_strict = False
    res = evaluate_hard_filters(current_user, work_outlook_mismatch_candidate, pref)
    assert res["status"] == "SOFT_MISMATCH"

def test_dealbreakers_still_block():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [dealbreaker_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_non_negotiables_are_respected():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [weak_preference_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_safety_still_blocks_before_preferences():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [unsafe_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_psychology_still_blocks_dangerous_candidates():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [angry_weak_repair_candidate])
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_strong_candidate_still_shown():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [strong_candidate])
    assert res["status"] == "HAS_CONSIDERED_CANDIDATES"

def test_no_suitable_candidates_still_returns_no_match():
    bad_candidates = [
        age_mismatch_candidate,
        banned_candidate,
        unsafe_candidate,
        angry_weak_repair_candidate,
        dealbreaker_candidate,
        insufficient_data_candidate,
        weak_preference_candidate
    ]
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, bad_candidates)
    assert res["status"] == "NO_SUITABLE_MATCHES_RIGHT_NOW"

def test_output_still_has_no_compatibility_percentage():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [strong_candidate])
    res_str = str(res).lower()
    assert "compatibility" not in res_str
    assert "percentage" not in res_str
    assert "score" not in res_str

def test_output_still_has_no_perfect_match_wording():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [strong_candidate])
    res_str = str(res).lower()
    assert "perfect match" not in res_str
    assert "guaranteed" not in res_str
    assert "soulmate" not in res_str
    assert "you should marry" not in res_str

def test_output_still_has_no_spiritual_worship_score():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [strong_candidate])
    res_str = str(res).lower()
    assert "spiritual_score" not in res_str
    assert "spiritual score" not in res_str
    assert "worship_score" not in res_str
    assert "worship score" not in res_str

def test_output_still_does_not_expose_private_raw_data():
    res = NISMatchmakingService.generate_considered_few(current_user, match_preference, [strong_candidate])
    res_str = str(res).lower()
    assert "private_notes" not in res_str
    assert "raw" not in res_str
    assert "aadhaar" not in res_str
    assert "selfie" not in res_str
    assert "government_id" not in res_str

def test_no_database_fastapi_firebase_dependency_is_used():
    # Check that the NIS module itself doesn't import database/fastapi/firebase
    # by examining the imports in the nis package files
    import os
    import re
    
    nis_dir = os.path.join(os.path.dirname(__file__), "..", "nis")
    forbidden_imports = {
        "from fastapi": "fastapi",
        "import fastapi": "fastapi",
        "from database": "database",
        "import database": "database",
        "firebase_admin": "firebase"
    }
    
    for root, dirs, files in os.walk(nis_dir):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    content = f.read()
                    for pattern, lib in forbidden_imports.items():
                        assert pattern not in content, f"{lib} imported in {file_path}"
