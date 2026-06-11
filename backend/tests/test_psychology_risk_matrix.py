from nis.models.user_profile import UserProfile
from nis.engines.psychology_risk_matrix import evaluate_risk_matrix

def create_base_user() -> UserProfile:
    return UserProfile(
        user_id="1", name="Test", age=25, gender="MALE", location="City", tradition="SUNNI",
        height_cm=180, marital_status="SINGLE", education_level="BS", occupation="Eng",
        work_outlook="Good", religious_practice_level="HIGH", islamic_environment_preference="HIGH",
        is_verified=True, is_banned=False, has_required_data=True, marriage_readiness="READY",
        emotional_steadiness="HIGH", anger_level="LOW", repair_style="GOOD", communication_style="OPEN",
        attachment_style="SECURE", family_involvement="LOW", family_pressure_level="LOW",
        boundary_strength="HIGH", financial_responsibility="HIGH", lifestyle_pattern="GOOD",
        safety_status="SAFE"
    )

def test_high_control_low_empathy_blocks():
    seeker = create_base_user()
    seeker.softness_level = "HIGH"
    
    candidate = create_base_user()
    candidate.control_tendency = "HIGH"
    candidate.empathy_level = "LOW"
    
    assert evaluate_risk_matrix(seeker, candidate) == "DANGEROUS_PAIRING_BLOCKED"

def test_high_religious_control_blocks():
    seeker = create_base_user()
    seeker.assertiveness_level = "LOW"
    
    candidate = create_base_user()
    candidate.religious_control_risk = "HIGH"
    candidate.humility_level = "LOW"
    
    assert evaluate_risk_matrix(seeker, candidate) == "DANGEROUS_PAIRING_BLOCKED"

def test_financial_control_blocks():
    seeker = create_base_user()
    seeker.softness_level = "HIGH"
    
    candidate = create_base_user()
    candidate.financial_control_tendency = "HIGH"
    candidate.decision_fairness = "LOW"
    
    assert evaluate_risk_matrix(seeker, candidate) == "DANGEROUS_PAIRING_BLOCKED"

def test_gaslighting_risk_blocks():
    seeker = create_base_user()
    seeker.boundary_strength = "LOW"
    
    candidate = create_base_user()
    candidate.gaslighting_risk = "HIGH"
    candidate.boundary_respect = "LOW"
    
    assert evaluate_risk_matrix(seeker, candidate) == "DANGEROUS_PAIRING_BLOCKED"

def test_possessiveness_isolation_blocks():
    seeker = create_base_user()
    seeker.assertiveness_level = "LOW"
    
    candidate = create_base_user()
    candidate.possessiveness_level = "HIGH"
    candidate.isolation_tendency = "HIGH"
    
    assert evaluate_risk_matrix(seeker, candidate) == "DANGEROUS_PAIRING_BLOCKED"

def test_family_pressure_blocks():
    seeker = create_base_user()
    seeker.boundary_strength = "LOW"
    
    candidate = create_base_user()
    candidate.family_pressure_misuse_risk = "HIGH"
    candidate.boundary_respect = "LOW"
    
    assert evaluate_risk_matrix(seeker, candidate) == "DANGEROUS_PAIRING_BLOCKED"

def test_weak_compatibility():
    seeker = create_base_user()
    candidate = create_base_user()
    candidate.control_tendency = "MEDIUM"
    candidate.empathy_level = "MODERATE"
    
    assert evaluate_risk_matrix(seeker, candidate) == "WEAK_COMPATIBILITY"

def test_safe_accountable_returns_safe():
    seeker = create_base_user()
    candidate = create_base_user()
    candidate.control_tendency = "LOW"
    candidate.empathy_level = "HIGH"
    candidate.accountability_level = "HIGH"
    candidate.boundary_respect = "HIGH"
    
    assert evaluate_risk_matrix(seeker, candidate) == "SAFE_COMPATIBLE"

def test_unknown_values_default_safely():
    seeker = create_base_user()
    candidate = create_base_user()
    # All defaults are UNKNOWN, should not crash, should be SAFE_COMPATIBLE normally unless rules match
    assert evaluate_risk_matrix(seeker, candidate) == "SAFE_COMPATIBLE"
