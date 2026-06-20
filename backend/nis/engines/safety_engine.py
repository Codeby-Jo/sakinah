from nis.models.candidate_profile import CandidateProfile

def evaluate_safety(candidate: CandidateProfile) -> dict:
    reasons = []
    
    if candidate.profile.is_banned:
        reasons.append("Candidate is banned.")
        return {"status": "BLOCKED", "reasons": reasons}
        
    if candidate.profile.safety_status == "BLOCKED":
        reasons.append("Candidate safety status is BLOCKED.")
        return {"status": "BLOCKED", "reasons": reasons}
        
    if candidate.profile.safety_status == "UNDER_REVIEW":
        reasons.append("Candidate safety status is UNDER_REVIEW.")
        return {"status": "REVIEW_REQUIRED", "reasons": reasons}
        
    if candidate.profile.safety_status == "REPORTED":
        reasons.append("Candidate safety status is REPORTED.")
        return {"status": "REVIEW_REQUIRED", "reasons": reasons}
        
    return {"status": "PASSED", "reasons": reasons}
