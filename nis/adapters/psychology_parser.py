def parse_psychology_responses(psy_prof) -> dict:
    """
    Translates raw multiple-choice survey strings from the frontend 
    into structured psychological metrics for the NIS Engine.
    """
    metrics = {
        "control_tendency": "UNKNOWN",
        "empathy_level": "UNKNOWN",
        "accountability_level": "UNKNOWN",
        "humility_level": "UNKNOWN",
        "boundary_respect": "UNKNOWN",
        "silent_treatment_pattern": "UNKNOWN",
        "financial_control_tendency": "UNKNOWN",
        "family_pressure_misuse_risk": "UNKNOWN",
        "possessiveness_level": "UNKNOWN",
        "isolation_tendency": "UNKNOWN",
        "decision_fairness": "UNKNOWN",
        "assertiveness_level": "UNKNOWN",
        "manipulation_risk": "UNKNOWN",
        "gaslighting_risk": "UNKNOWN",
        "religious_control_risk": "UNKNOWN",
        "conflict_aggression_level": "UNKNOWN",
        "softness_level": "UNKNOWN",
        "emotional_maturity": "UNKNOWN"
    }

    if not psy_prof:
        return metrics

    # 1. Disagreement Response
    ans_disagree = psy_prof.disagreement_response
    if ans_disagree == "FAIR_SOLUTION":
        metrics["decision_fairness"] = "HIGH"
        metrics["empathy_level"] = "HIGH"
    elif ans_disagree == "EXPLAIN_STRONGLY":
        metrics["assertiveness_level"] = "HIGH"
        metrics["empathy_level"] = "MODERATE"
    elif ans_disagree == "EXPECT_SPOUSE_TO_ADJUST":
        metrics["control_tendency"] = "HIGH"
        metrics["decision_fairness"] = "LOW"
        metrics["boundary_respect"] = "LOW"
    elif ans_disagree == "SILENT_OR_DISTANT":
        metrics["silent_treatment_pattern"] = "HIGH"
        metrics["conflict_aggression_level"] = "PASSIVE_AGGRESSIVE"

    # 2. Family Pressure Response
    ans_fam = psy_prof.family_pressure_response
    if ans_fam == "BALANCE_AND_PROTECT_FAIRNESS":
        metrics["boundary_respect"] = "HIGH"
        metrics["decision_fairness"] = "HIGH"
    elif ans_fam == "CONVINCE_SPOUSE_TO_ADJUST":
        metrics["family_pressure_misuse_risk"] = "HIGH"
        metrics["boundary_respect"] = "LOW"
    elif ans_fam == "FAMILY_COMES_FIRST":
        metrics["family_pressure_misuse_risk"] = "HIGH"
        metrics["boundary_respect"] = "LOW"
    elif ans_fam == "WALI_HELP_RESPECTFULLY":
        metrics["boundary_respect"] = "MODERATE"

    # 3. Accountability Response
    ans_acc = psy_prof.accountability_response
    if ans_acc == "APOLOGIZE_AND_REPAIR":
        metrics["accountability_level"] = "HIGH"
        metrics["humility_level"] = "HIGH"
    elif ans_acc == "EXPLAIN_FIRST":
        metrics["accountability_level"] = "MODERATE"
        metrics["humility_level"] = "MODERATE"
    elif ans_acc == "NEEDS_TIME_TO_ACCEPT":
        metrics["accountability_level"] = "MODERATE"
    elif ans_acc == "DIFFICULT_TO_APOLOGIZE":
        metrics["accountability_level"] = "LOW"
        metrics["humility_level"] = "LOW"
        metrics["empathy_level"] = "LOW"

    # 4. Personal Space Response
    ans_space = psy_prof.personal_space_response
    if ans_space == "HEALTHY_SPACE_IMPORTANT":
        metrics["possessiveness_level"] = "LOW"
        metrics["boundary_respect"] = "HIGH"
    elif ans_space == "OKAY_IF_TRUST_CLEAR":
        metrics["possessiveness_level"] = "MODERATE"
    elif ans_space == "PREFER_KNOWING_CLOSELY":
        metrics["possessiveness_level"] = "HIGH"
        metrics["boundary_respect"] = "LOW"
    elif ans_space == "DECIDED_BY_ME_OR_FAMILY":
        metrics["isolation_tendency"] = "HIGH"
        metrics["control_tendency"] = "HIGH"
        metrics["possessiveness_level"] = "HIGH"

    # 5. Financial Expectations (V2)
    ans_fin = psy_prof.financial_expectations
    if ans_fin == "TRANSPARENCY_AND_PLANNING":
        metrics["financial_control_tendency"] = "LOW"
    elif ans_fin == "AGREED_ROLES_MUTUAL_TRUST":
        metrics["financial_control_tendency"] = "LOW"
    elif ans_fin == "ONE_HAS_FINAL_CONTROL":
        metrics["financial_control_tendency"] = "HIGH"
        metrics["control_tendency"] = "HIGH"
    elif ans_fin == "EARNER_DECIDES_MORE":
        metrics["financial_control_tendency"] = "HIGH"

    return metrics
