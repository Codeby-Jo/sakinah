def map_scenario_answers_to_signals(answers: dict) -> dict:
    """
    Safely maps frontend scenario questions to private internal psychology signals.
    Never exposes raw signals or labels to frontend.
    """
    signals = {
        "control_tendency": "UNKNOWN",
        "empathy_level": "UNKNOWN",
        "accountability_level": "UNKNOWN",
        "humility_level": "UNKNOWN",
        "boundary_respect": "UNKNOWN",
        "financial_control_tendency": "UNKNOWN",
        "family_pressure_misuse_risk": "UNKNOWN",
        "religious_control_risk": "UNKNOWN",
        "softness_level": "UNKNOWN",
        "assertiveness_level": "UNKNOWN",
        "decision_fairness": "UNKNOWN",
        "manipulation_risk": "UNKNOWN",
        "gaslighting_risk": "UNKNOWN",
        "possessiveness_level": "UNKNOWN",
        "isolation_tendency": "UNKNOWN",
        "conflict_aggression_level": "UNKNOWN",
        "emotional_maturity": "UNKNOWN",
        "silent_treatment_pattern": "UNKNOWN",
    }

    if not isinstance(answers, dict):
        return signals

    # Map disagreement response
    disagreement = answers.get("disagreement_response")
    if disagreement == "EXPECT_SPOUSE_TO_ADJUST":
        signals["control_tendency"] = "HIGH"
        signals["decision_fairness"] = "LOW"
    elif disagreement == "FAIR_SOLUTION":
        signals["control_tendency"] = "LOW"
        signals["decision_fairness"] = "HIGH"

    # Map family pressure response
    family = answers.get("family_pressure_response")
    if family == "BALANCE_AND_PROTECT_FAIRNESS":
        signals["family_pressure_misuse_risk"] = "LOW"
    elif family in ["SIDE_WITH_FAMILY_ALWAYS", "EXPECT_SPOUSE_TO_ENDURE"]:
        signals["family_pressure_misuse_risk"] = "HIGH"
        signals["boundary_respect"] = "LOW"

    # Map accountability
    accountability = answers.get("accountability_response")
    if accountability == "APOLOGIZE_AND_REPAIR":
        signals["accountability_level"] = "HIGH"
        signals["humility_level"] = "HIGH"
    elif accountability in ["DEFEND_AND_BLAME", "DENY_MISTAKE"]:
        signals["accountability_level"] = "LOW"
        signals["humility_level"] = "LOW"

    # Map boundary response
    boundary = answers.get("boundary_response")
    if boundary == "TAKE_BOUNDARY_SERIOUSLY":
        signals["boundary_respect"] = "HIGH"
    elif boundary == "DISMISS_AS_SENSITIVE":
        signals["boundary_respect"] = "LOW"
        signals["empathy_level"] = "LOW"

    # Map emotional self description
    emotion = answers.get("emotional_self_description")
    if emotion == "SOFT_HEARTED":
        signals["softness_level"] = "HIGH"
        signals["empathy_level"] = "HIGH"
    elif emotion == "LOGICAL_AND_STRICT":
        signals["softness_level"] = "LOW"

    # Map sensitive partner response
    sensitive = answers.get("sensitive_partner_response")
    if sensitive == "GENTLE_AND_CAREFUL":
        signals["empathy_level"] = "HIGH"
    elif sensitive == "TELL_THEM_TO_TOUGHEN_UP":
        signals["empathy_level"] = "LOW"
        signals["softness_level"] = "LOW"

    # Map religious leadership
    religious = answers.get("religious_leadership_response")
    if religious == "MERCY_AND_MUTUAL_GROWTH":
        signals["religious_control_risk"] = "LOW"
    elif religious == "STRICT_OBEDIENCE_EXPECTED":
        signals["religious_control_risk"] = "HIGH"

    # Map financial decision
    financial = answers.get("financial_decision_response")
    if financial == "TRANSPARENCY_AND_PLANNING":
        signals["financial_control_tendency"] = "LOW"
    elif financial == "MY_MONEY_MY_RULES":
        signals["financial_control_tendency"] = "HIGH"

    return signals
