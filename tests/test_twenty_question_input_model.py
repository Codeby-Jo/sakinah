import pytest
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData

def get_valid_raw_answers():
    return {
        "age": 28,
        "gender": "MALE",
        "location": "New York",
        "religious_practice_and_islamic_home": "PRACTICING",
        "marriage_readiness": "READY"
    }

def get_valid_kyc_data():
    return SystemKycData(
        user_id="user_123",
        is_verified=True,
        verified_gender="MALE",
        verified_age=28,
        safety_status="SAFE"
    )

def test_can_create_with_valid_answers():
    raw = get_valid_raw_answers()
    kyc = get_valid_kyc_data()
    
    model = TwentyQuestionInput(raw, kyc)
    assert model.validate() is True
    assert model.age.resolved_value == 28
    assert model.gender.resolved_value == "MALE"

def test_required_fields_enforced():
    raw = get_valid_raw_answers()
    del raw["age"]  # Remove a required field
    kyc = get_valid_kyc_data()
    
    model = TwentyQuestionInput(raw, kyc)
    with pytest.raises(ValueError, match="Missing required field: age"):
        model.validate()

def test_missing_optional_fields_default_safely():
    raw = get_valid_raw_answers()
    kyc = get_valid_kyc_data()
    
    model = TwentyQuestionInput(raw, kyc)
    assert model.validate() is True
    # Marital status is optional, should default safely to NEVER_MARRIED
    assert model.marital_status.resolved_value == "NEVER_MARRIED"

def test_unknown_answer_codes_do_not_crash():
    raw = get_valid_raw_answers()
    raw["communication_style"] = "WEIRD_UNKNOWN_CODE_999"
    kyc = get_valid_kyc_data()
    
    model = TwentyQuestionInput(raw, kyc)
    assert model.validate() is True
    assert model.communication_style.resolved_value == "WEIRD_UNKNOWN_CODE_999"

def test_backend_kyc_fields_separation():
    raw = get_valid_raw_answers()
    kyc = get_valid_kyc_data()
    model = TwentyQuestionInput(raw, kyc)
    
    assert model.system_kyc.user_id == "user_123"
    assert model.system_kyc.is_verified is True
    assert model.system_kyc.safety_status == "SAFE"
    
    # Prove that the system KYC fields are strictly separate from the 20 raw answers
    assert not hasattr(model, "is_verified") # It's under system_kyc

def test_model_stores_crisp_answers_not_derived():
    raw = get_valid_raw_answers()
    kyc = get_valid_kyc_data()
    model = TwentyQuestionInput(raw, kyc)
    
    # Prove it doesn't store the 85 fields
    assert not hasattr(model, "gaslighting_risk")
    assert not hasattr(model, "control_tendency")
    assert not hasattr(model, "difficult_conflict_styles")

def test_exposes_derived_signal_targets():
    raw = get_valid_raw_answers()
    kyc = get_valid_kyc_data()
    model = TwentyQuestionInput(raw, kyc)
    
    # Ensure targets are properly listed for Phase 3
    assert "user_profile.anger_level" in model.conflict_repair.derived_signal_targets
    assert "user_profile.boundary_respect" in model.boundary_emotional_safety.derived_signal_targets
    assert "match_preference.preferred_min_age" in model.pref_age_range.derived_signal_targets
