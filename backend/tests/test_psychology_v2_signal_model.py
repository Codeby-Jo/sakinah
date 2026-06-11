from nis.models.user_profile import UserProfile
from nis.adapters.db_to_nis_mapper import map_db_user_to_user_profile

def test_user_profile_accepts_new_fields():
    profile = UserProfile(
        user_id="1", name="Test", age=25, gender="MALE", location="City", tradition="SUNNI",
        height_cm=180, marital_status="SINGLE", education_level="BS", occupation="Eng",
        work_outlook="Good", religious_practice_level="HIGH", islamic_environment_preference="HIGH",
        is_verified=True, is_banned=False, has_required_data=True, marriage_readiness="READY",
        emotional_steadiness="HIGH", anger_level="LOW", repair_style="GOOD", communication_style="OPEN",
        attachment_style="SECURE", family_involvement="LOW", family_pressure_level="LOW",
        boundary_strength="HIGH", financial_responsibility="HIGH", lifestyle_pattern="GOOD",
        safety_status="SAFE",
        # New psychology fields
        control_tendency="LOW",
        empathy_level="HIGH",
        accountability_level="HIGH",
        humility_level="HIGH",
        boundary_respect="HIGH",
        manipulation_risk="LOW",
        silent_treatment_pattern="LOW",
        gaslighting_risk="LOW",
        financial_control_tendency="LOW",
        family_pressure_misuse_risk="LOW",
        religious_control_risk="LOW",
        possessiveness_level="LOW",
        isolation_tendency="LOW",
        decision_fairness="HIGH",
        softness_level="MEDIUM",
        assertiveness_level="HIGH",
        conflict_aggression_level="LOW",
        emotional_maturity="HIGH"
    )
    assert profile.control_tendency == "LOW"
    assert profile.empathy_level == "HIGH"

def test_user_profile_works_when_fields_missing():
    # If we do not pass the new fields to the dataclass directly, they should use default "UNKNOWN"
    # Actually dataclass with defaults allows omitting them
    profile = UserProfile(
        user_id="1", name="Test", age=25, gender="MALE", location="City", tradition="SUNNI",
        height_cm=180, marital_status="SINGLE", education_level="BS", occupation="Eng",
        work_outlook="Good", religious_practice_level="HIGH", islamic_environment_preference="HIGH",
        is_verified=True, is_banned=False, has_required_data=True, marriage_readiness="READY",
        emotional_steadiness="HIGH", anger_level="LOW", repair_style="GOOD", communication_style="OPEN",
        attachment_style="SECURE", family_involvement="LOW", family_pressure_level="LOW",
        boundary_strength="HIGH", financial_responsibility="HIGH", lifestyle_pattern="GOOD",
        safety_status="SAFE"
    )
    assert profile.control_tendency == "UNKNOWN"
    assert profile.empathy_level == "UNKNOWN"

def test_db_mapper_maps_new_fields():
    db_dict = {
        "user_id": "1", "name": "Test", "gender": "MALE", "control_tendency": "HIGH", "decision_fairness": "LOW"
    }
    profile = map_db_user_to_user_profile(db_dict)
    assert profile.control_tendency == "HIGH"
    assert profile.decision_fairness == "LOW"

def test_db_mapper_defaults_missing_values():
    db_dict = {
        "user_id": "1", "name": "Test", "gender": "MALE"
    }
    profile = map_db_user_to_user_profile(db_dict)
    assert profile.control_tendency == "UNKNOWN"
    assert profile.isolation_tendency == "UNKNOWN"
