from nis.models.user_profile import UserProfile
from nis.models.candidate_profile import CandidateProfile
from nis.engines.psychology_risk_matrix import evaluate_risk_matrix
from nis.engines.vulnerability_protection_engine import evaluate_vulnerability_protection

def evaluate_psychology(current_user: UserProfile, candidate: CandidateProfile) -> dict:
    status = "PASSED"
    dangerous_dynamics = []
    healthy_complementarity = []
    reasons = []

    u = current_user
    c = candidate.profile

    weak_repair_styles = ["DEFENSIVE", "BLAME_SHIFTING", "AVOIDANT"]
    defensive_styles = ["DEFENSIVE", "BLAME_SHIFTING"]

    # ---------------------------------------------------------
    # PSYCHOLOGY V2 EVALUATION
    # ---------------------------------------------------------
    risk_status = evaluate_risk_matrix(u, c)
    if risk_status == "DANGEROUS_PAIRING_BLOCKED":
        status = "REVIEW_REQUIRED"
        # We do NOT expose dangerous labels, we use a generic internal reason
        reasons.append("Psychological traits indicate a potentially harmful dynamic. Wali review recommended.")
        dangerous_dynamics.append("High risk pairing flagged for review.")
    
    vuln_status = evaluate_vulnerability_protection(u, c)
    if vuln_status == "DANGEROUS_PAIRING_BLOCKED":
        status = "REVIEW_REQUIRED"
        reasons.append("Mismatch in boundary strength and control tendency. Wali review recommended.")
        dangerous_dynamics.append("Vulnerability mismatch flagged for review.")

    # If WEAK_COMPATIBILITY but not blocked, lower ranking status
    if status != "BLOCKED" and (risk_status == "WEAK_COMPATIBILITY" or vuln_status == "WEAK_COMPATIBILITY"):
        status = "WEAK"
        reasons.append("Psychological traits indicate weak compatibility.")
    
    # ---------------------------------------------------------
    # EXISTING PSYCHOLOGY V1 EVALUATION
    # ---------------------------------------------------------
    
    # Block or flag:
    
    # 7. Either user not ready
    if u.marriage_readiness == "NOT_READY" or c.marriage_readiness == "NOT_READY":
        status = "BLOCKED"
        dangerous_dynamics.append("Not ready for marriage.")
        reasons.append("One or both individuals are not ready for marriage.")

    # 1. High anger + high anger
    if u.anger_level == "HIGH" and c.anger_level == "HIGH":
        status = "REVIEW_REQUIRED"
        dangerous_dynamics.append("High mutual frustration levels.")
        reasons.append("Both individuals have high anger levels, causing volatile dynamics.")

    # 2. High anger + weak repair
    if (u.anger_level == "HIGH" or c.anger_level == "HIGH") and (u.repair_style in weak_repair_styles or c.repair_style in weak_repair_styles):
        status = "REVIEW_REQUIRED"
        dangerous_dynamics.append("High frustration with weak repair.")
        reasons.append("Combination of high anger and weak repair style observed.")

    # 3. Volatile + volatile
    if u.emotional_steadiness == "VOLATILE" and c.emotional_steadiness == "VOLATILE":
        status = "REVIEW_REQUIRED"
        dangerous_dynamics.append("High mutual emotional volatility.")
        reasons.append("Both individuals exhibit volatile emotional steadiness.")

    # 5. Financial irresponsibility + financial irresponsibility
    if u.financial_responsibility == "IRRESPONSIBLE" and c.financial_responsibility == "IRRESPONSIBLE":
        status = "REVIEW_REQUIRED"
        dangerous_dynamics.append("Mutual financial irresponsibility.")
        reasons.append("Both individuals display financial irresponsibility.")

    # 9. Aggressive communication + defensive repair
    if (u.communication_style == "AGGRESSIVE" or c.communication_style == "AGGRESSIVE") and (u.repair_style in defensive_styles or c.repair_style in defensive_styles):
        status = "REVIEW_REQUIRED"
        dangerous_dynamics.append("Aggressive communication with defensive repair.")
        reasons.append("Aggressive communication paired with defensive repair styles is present.")

    # 4. Avoidant + anxious unhealthy loop
    if (u.attachment_style == "AVOIDANT" and c.attachment_style == "ANXIOUS") or (u.attachment_style == "ANXIOUS" and c.attachment_style == "AVOIDANT"):
        if status != "BLOCKED":
            status = "REVIEW_REQUIRED"
        dangerous_dynamics.append("Avoidant/anxious loop.")
        reasons.append("Potential for an avoidant/anxious relationship loop.")

    # 8. Weak boundaries + high family pressure
    if (u.boundary_strength == "WEAK" or c.boundary_strength == "WEAK") and (u.family_pressure_level == "HIGH" or c.family_pressure_level == "HIGH"):
        if status != "BLOCKED":
            status = "REVIEW_REQUIRED"
        dangerous_dynamics.append("Weak boundaries with high family pressure.")
        reasons.append("Weak personal boundaries combined with high family pressure observed.")

    # Healthy complementarity:
    if ((u.communication_style == "CALM" and c.communication_style == "EXPRESSIVE") or (c.communication_style == "CALM" and u.communication_style == "EXPRESSIVE")) and (u.repair_style == "REPAIR_ORIENTED" and c.repair_style == "REPAIR_ORIENTED"):
        healthy_complementarity.append("Calm and expressive communication styles with good repair.")

    if (u.lifestyle_pattern == "STRUCTURED" and c.lifestyle_pattern == "FLEXIBLE") or (c.lifestyle_pattern == "STRUCTURED" and u.lifestyle_pattern == "FLEXIBLE"):
        healthy_complementarity.append("Complementary lifestyle patterns (structured and flexible).")

    if (u.emotional_steadiness == "STEADY" and c.emotional_steadiness == "MODERATE") or (c.emotional_steadiness == "STEADY" and u.emotional_steadiness == "MODERATE"):
        healthy_complementarity.append("Complementary emotional steadiness (steady and moderate).")

    if (u.financial_responsibility == "CAREFUL" and c.financial_responsibility == "BALANCED") or (c.financial_responsibility == "CAREFUL" and u.financial_responsibility == "BALANCED"):
        healthy_complementarity.append("Complementary financial responsibility (careful and balanced).")

    if (u.communication_style == "DIRECT" and c.repair_style == "REPAIR_ORIENTED") or (c.communication_style == "DIRECT" and u.repair_style == "REPAIR_ORIENTED"):
        healthy_complementarity.append("Direct communication paired with a repair-oriented style.")

    return {
        "status": status,
        "dangerous_dynamics": dangerous_dynamics,
        "healthy_complementarity": healthy_complementarity,
        "reasons": reasons
    }
