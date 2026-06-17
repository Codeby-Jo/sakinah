from nis.models.user_profile import UserProfile

def evaluate_risk_matrix(seeker: UserProfile, candidate: UserProfile) -> str:
    """
    Evaluates the psychological pairing risk between a seeker and candidate.
    Returns: SAFE_COMPATIBLE, WEAK_COMPATIBILITY, or DANGEROUS_PAIRING_BLOCKED.
    """

    # Helper function to check if someone is "soft" or vulnerable
    def is_vulnerable(user: UserProfile) -> bool:
        if user.softness_level == "HIGH" or user.assertiveness_level == "LOW" or user.communication_style in ["AVOIDANT", "SILENT", "CONFLICT_AVOIDANT"]:
            return True
        return False

    def is_low_boundary(user: UserProfile) -> bool:
        return user.boundary_strength == "LOW" or user.boundary_respect == "LOW"

    # Rule 1: High control + Low empathy + Vulnerable partner
    if candidate.control_tendency == "HIGH" and candidate.empathy_level == "LOW" and is_vulnerable(seeker):
        return "DANGEROUS_PAIRING_BLOCKED"

    # Rule 2: High religious control + Low humility + Vulnerable partner
    if candidate.religious_control_risk == "HIGH" and candidate.humility_level == "LOW" and is_vulnerable(seeker):
        return "DANGEROUS_PAIRING_BLOCKED"

    # Rule 3: High financial control + Low decision fairness + Vulnerable partner
    if candidate.financial_control_tendency == "HIGH" and candidate.decision_fairness == "LOW" and is_vulnerable(seeker):
        return "DANGEROUS_PAIRING_BLOCKED"

    # Rule 4: Gaslighting/Manipulation + Low boundary respect + Low boundary partner
    if (candidate.gaslighting_risk == "HIGH" or candidate.manipulation_risk == "HIGH") and candidate.boundary_respect == "LOW" and is_low_boundary(seeker):
        return "DANGEROUS_PAIRING_BLOCKED"

    # Rule 5: Possessiveness + Isolation + Low assertiveness partner
    if candidate.possessiveness_level == "HIGH" and candidate.isolation_tendency == "HIGH" and seeker.assertiveness_level == "LOW":
        return "DANGEROUS_PAIRING_BLOCKED"

    # Rule 6: Family pressure misuse + Low boundary respect + Family pressure vulnerable partner
    if candidate.family_pressure_misuse_risk == "HIGH" and candidate.boundary_respect == "LOW" and (is_low_boundary(seeker) or seeker.family_pressure_level == "HIGH"):
        return "DANGEROUS_PAIRING_BLOCKED"

    # WEAK COMPATIBILITY CHECKS
    if candidate.control_tendency == "MEDIUM" and candidate.empathy_level in ["MEDIUM", "MODERATE", "UNKNOWN"]:
        return "WEAK_COMPATIBILITY"

    if candidate.emotional_maturity == "LOW" and candidate.repair_style in ["UNKNOWN", "UNCLEAR"]:
        return "WEAK_COMPATIBILITY"

    # Default Safe
    return "SAFE_COMPATIBLE"
