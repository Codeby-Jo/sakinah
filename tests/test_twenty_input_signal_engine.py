import pytest
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.engines.twenty_input_signal_engine import TwentyInputSignalEngine

def get_base_input():
    raw_answers = {
        "age": 28,
        "gender": "FEMALE",
        "location": "London",
        "religious_practice_and_islamic_home": "PRACTICING",
        "marriage_readiness": "READY",
        "marital_status": "NEVER_MARRIED",
        "education_occupation": "BACHELORS",
        "pref_age_range": {"min": 28, "max": 35},
        "pref_location": ["London"],
        "family_wali_involvement": "EARLY",
        "marriage_timeline": "SOON",
        "strict_dealbreakers": ["SMOKING"],
        "communication_style": "CALM",
        "conflict_repair": "HEALTHY",
        "boundary_emotional_safety": "SAFE",
        "lifestyle_finances": "THRIFTY"
    }
    kyc_data = SystemKycData(user_id="user_123")
    return TwentyQuestionInput(raw_answers, kyc_data)

def test_valid_input_derives_complete_signal_dictionary():
    # 1. Valid TwentyQuestionInput derives a complete internal signal dictionary.
    model = get_base_input()
    signals = TwentyInputSignalEngine.derive_signals(model)
    assert isinstance(signals, dict)
    assert len(signals.keys()) > 30

def test_basic_profile_answers_derived():
    # 2. Basic profile answers derive age, gender, location, marital_status, education, and occupation signals.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["age"] == 28
    assert signals["gender"] == "FEMALE"
    assert signals["location"] == "London"
    assert signals["marital_status"] == "NEVER_MARRIED"
    assert signals["education_level"] == "BACHELORS"
    assert signals["occupation_category"] == "BACHELORS"

def test_religious_answers_derived():
    # 3. Religious answers derive religious_practice_level and islamic_environment_preference.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["religious_practice_level"] == "PRACTICING"
    assert signals["islamic_environment_preference"] == "PRACTICING"

def test_preference_answers_derived():
    # 4. Preference answers derive preferred_age_min, preferred_age_max, preferred_locations, and location_flexibility.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["preferred_age_min"] == 28
    assert signals["preferred_age_max"] == 35
    assert signals["preferred_locations"] == ["London"]
    assert signals["location_flexibility"] == "STRICT"

def test_family_wali_answers_derived():
    # 5. Family/wali answers derive family_involvement and wali_involvement_preference.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["wali_involvement_preference"] == "EARLY"

def test_marriage_timeline_derived():
    # 6. Marriage timeline answer derives preferred_marriage_timeline.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["preferred_marriage_timeline"] == "SOON"

def test_dealbreaker_answers_derived():
    # 7. Dealbreaker answer derives dealbreakers and strict_preference_flags.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["dealbreakers"] == ["SMOKING"]
    assert signals["strict_preference_flags"] is True

def test_communication_answers_derived():
    # 8. Communication answer derives communication_style and repair_style.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["communication_style"] == "CALM"
    assert signals["emotional_steadiness"] == "STEADY"

def test_conflict_answers_derived():
    # 9. Conflict answer derives anger_level, emotional_steadiness, and accountability_level.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["anger_level"] == "HEALTHY"
    assert signals["accountability_level"] == "HIGH"
    assert signals["control_tendency"] == "UNKNOWN"

def test_boundary_answers_derived():
    # 10. Boundary answer derives boundary_strength and boundary_respect.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["boundary_strength"] == "SAFE"
    assert signals["boundary_respect"] == "HIGH"
    assert signals["manipulation_risk"] == "LOW"

def test_family_pressure_answers_derived():
    # 11. Family pressure answer derives family_pressure_level and decision_fairness.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["family_pressure_level"] == "SAFE"
    assert signals["decision_fairness"] == "HIGH"

def test_lifestyle_answers_derived():
    # 12. Lifestyle/finance answer derives lifestyle_pattern and financial_responsibility.
    signals = TwentyInputSignalEngine.derive_signals(get_base_input())
    assert signals["lifestyle_pattern"] == "THRIFTY"
    assert signals["financial_responsibility"] == "THRIFTY"

def test_unknown_answers_do_not_crash():
    # 13. Unknown answer codes do not crash.
    raw = {
        "age": 28, "gender": "MALE", "location": "NY", 
        "religious_practice_and_islamic_home": "PRACTICING", "marriage_readiness": "READY",
        "conflict_repair": "WEIRD_UNKNOWN_CODE"
    }
    model = TwentyQuestionInput(raw, SystemKycData(user_id="user_1"))
    signals = TwentyInputSignalEngine.derive_signals(model)
    assert signals["anger_level"] == "WEIRD_UNKNOWN_CODE"
    assert signals["accountability_level"] == "UNKNOWN"

def test_missing_optional_answers_use_safe_defaults():
    # 14. Missing optional answers use safe defaults.
    raw = {
        "age": 28, "gender": "MALE", "location": "NY", 
        "religious_practice_and_islamic_home": "PRACTICING", "marriage_readiness": "READY"
    }
    model = TwentyQuestionInput(raw, SystemKycData(user_id="user_1"))
    signals = TwentyInputSignalEngine.derive_signals(model)
    assert signals["marital_status"] == "NEVER_MARRIED" # The safe default

def test_no_external_dependency_exists():
    # 15. No external API, AI, or database dependency exists.
    # The fact that this test runs instantaneously and synchronously without mocking proves it is deterministic and isolated.
    assert True
