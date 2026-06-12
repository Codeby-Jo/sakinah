from nis.models.user_profile import UserProfile

def evaluate_human_review_trigger(candidate: UserProfile) -> dict:
    """
    Evaluates if a candidate requires human review based on psychological risk patterns.
    """
    triggers = []
    
    if candidate.manipulation_risk == "HIGH":
        triggers.append("HIGH_MANIPULATION_RISK")
        
    if candidate.gaslighting_risk == "HIGH":
        triggers.append("HIGH_GASLIGHTING_RISK")
        
    if candidate.religious_control_risk == "HIGH":
        triggers.append("HIGH_RELIGIOUS_CONTROL_RISK")
        
    if candidate.financial_control_tendency == "HIGH":
        triggers.append("HIGH_FINANCIAL_CONTROL_TENDENCY")
        
    if candidate.possessiveness_level == "HIGH" and candidate.isolation_tendency == "HIGH":
        triggers.append("POSSESSIVE_ISOLATION_PATTERN")
        
    if candidate.conflict_aggression_level == "HIGH" and candidate.accountability_level == "LOW":
        triggers.append("AGGRESSIVE_LOW_ACCOUNTABILITY")
        
    if triggers:
        return {
            "requires_human_review": True,
            "review_category": "PSYCHOLOGY_RISK",
            "trigger_reasons": triggers
        }
        
    return {
        "requires_human_review": False
    }
