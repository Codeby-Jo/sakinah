def decide_visibility(
    safety_result: dict,
    hard_filter_result: dict,
    preference_result: dict,
    psychology_result: dict
) -> dict:
    reasons = []

    # 1. Safety check
    if safety_result.get("status") == "BLOCKED":
        reasons.extend(safety_result.get("reasons", []))
        return {"status": "BLOCKED", "reasons": reasons}

    # 2. Hard filter check
    if hard_filter_result.get("status") == "BLOCKED":
        reasons.extend(hard_filter_result.get("reasons", []))
        return {"status": "BLOCKED", "reasons": reasons}

    # 3. Psychology check
    if psychology_result.get("status") == "BLOCKED":
        reasons.extend(psychology_result.get("reasons", []))
        return {"status": "BLOCKED", "reasons": reasons}

    # 4. Review Required check
    statuses = [
        safety_result.get("status"),
        hard_filter_result.get("status"),
        psychology_result.get("status")
    ]
    
    if "REVIEW_REQUIRED" in statuses:
        if safety_result.get("status") == "REVIEW_REQUIRED":
            reasons.extend(safety_result.get("reasons", []))
        if psychology_result.get("status") == "REVIEW_REQUIRED":
            reasons.extend(psychology_result.get("reasons", []))
        return {"status": "REVIEW_REQUIRED", "reasons": reasons}

    # 5. Preference mismatch check
    serious_mismatches = preference_result.get("serious_mismatches", [])
    if len(serious_mismatches) >= 2:
        reasons.extend(serious_mismatches)
        reasons.append(f"Blocked due to {len(serious_mismatches)} serious mismatches in preferences.")
        return {"status": "BLOCKED", "reasons": reasons}

    soft_mismatches = preference_result.get("soft_mismatches", [])
    if len(soft_mismatches) >= 50: # arbitrary high number for "too many"
        reasons.append("Blocked due to too many soft mismatches.")
        return {"status": "BLOCKED", "reasons": reasons}

    # 6. All checks pass
    reasons.append("Candidate passed all safety, hard filter, preference, and psychological checks.")
    return {"status": "SHOWN", "reasons": reasons}
