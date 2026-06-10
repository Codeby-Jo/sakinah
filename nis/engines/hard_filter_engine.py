from nis.models.candidate_profile import CandidateProfile
from nis.models.match_preference import MatchPreference
from nis.models.user_profile import UserProfile

def evaluate_hard_filters(current_user: UserProfile, candidate: CandidateProfile, preference: MatchPreference) -> dict:
    reasons = []
    soft_mismatches = []
    
    # 1. Required data check
    if not candidate.profile.has_required_data:
        reasons.append("Candidate is missing required data.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
        
    # 2. Verification check
    if not candidate.profile.is_verified:
        reasons.append("Candidate is not verified.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
        
    # 3. Banned check
    if candidate.profile.is_banned:
        reasons.append("Candidate is banned.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
        
    # 4. Gender Eligibility
    if not current_user.gender:
        reasons.append("Current user gender is missing.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
    if not candidate.profile.gender:
        reasons.append("Candidate gender is missing.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
    if current_user.gender == candidate.profile.gender:
        reasons.append("Same-gender matching is not allowed.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
    if current_user.gender == "MALE" and candidate.profile.gender != "FEMALE":
        reasons.append("Male seeker must receive female candidate.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
    if current_user.gender == "FEMALE" and candidate.profile.gender != "MALE":
        reasons.append("Female seeker must receive male candidate.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}

    # 5. Age
    age = candidate.profile.age
    if age is None:
        reasons.append("Candidate age is missing.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
    if not (preference.preferred_min_age <= age <= preference.preferred_max_age):
        if preference.age_is_strict:
            reasons.append(f"Candidate age {age} is outside strict preferred range.")
            return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
        else:
            soft_mismatches.append(f"Candidate age {age} is outside flexible preferred range.")

    # 6. Height
    c_height = candidate.profile.height_cm
    p_min_h = preference.preferred_min_height_cm
    p_max_h = preference.preferred_max_height_cm
    if p_min_h is not None and p_max_h is not None:
        if c_height is None:
            if preference.height_is_strict:
                reasons.append("Candidate height is missing.")
                return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
            else:
                soft_mismatches.append("Candidate height is missing.")
        elif not (p_min_h <= c_height <= p_max_h):
            if preference.height_is_strict:
                reasons.append(f"Candidate height {c_height} is outside strict preferred range.")
                return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
            else:
                soft_mismatches.append(f"Candidate height {c_height} is outside flexible preferred range.")

    # 7. Marital status
    if preference.preferred_marital_statuses:
        if candidate.profile.marital_status not in preference.preferred_marital_statuses:
            if preference.marital_status_is_strict:
                reasons.append("Candidate marital status does not match strict preferences.")
                return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
            else:
                soft_mismatches.append("Candidate marital status differs from flexible preference.")

    # 8. Location
    if candidate.profile.location not in preference.preferred_locations:
        if preference.location_is_strict:
            reasons.append("Candidate location is not in strict preferred locations.")
            return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
        else:
            soft_mismatches.append("Candidate location differs from preferred locations.")

    # 9. Tradition/maslak
    if preference.tradition_importance == "REQUIRED" and candidate.profile.tradition != preference.preferred_tradition:
        reasons.append("Candidate tradition does not match required tradition.")
        return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
    elif preference.tradition_importance == "PREFERRED" and candidate.profile.tradition != preference.preferred_tradition:
        soft_mismatches.append("Candidate tradition differs from preferred.")
        
    # 10. Education
    if preference.preferred_education_levels:
        if candidate.profile.education_level not in preference.preferred_education_levels:
            if preference.education_is_strict:
                reasons.append("Candidate education does not match strict preferences.")
                return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
            else:
                soft_mismatches.append("Candidate education differs from flexible preference.")

    # 11. Occupation
    if preference.preferred_occupations:
        if candidate.profile.occupation not in preference.preferred_occupations:
            if preference.occupation_is_strict:
                reasons.append("Candidate occupation does not match strict preferences.")
                return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
            else:
                soft_mismatches.append("Candidate occupation differs from flexible preference.")

    # 12. Work outlook
    if preference.preferred_work_outlook:
        if candidate.profile.work_outlook not in preference.preferred_work_outlook:
            if preference.work_outlook_is_strict:
                reasons.append("Candidate work outlook does not match strict preferences.")
                return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
            else:
                soft_mismatches.append("Candidate work outlook differs from flexible preference.")

    # 13. Dealbreaker check
    for trait in candidate.known_dealbreaker_traits:
        if trait in preference.dealbreakers or trait in preference.custom_dealbreakers:
            reasons.append(f"Candidate has known dealbreaker trait: {trait}.")
            return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}
            
    # 14. Non-negotiable hard checks
    dangerous_non_negotiables = {"ABUSIVE_BEHAVIOR", "DISHONESTY", "REFUSES_IN_APP_SAFETY"}
    for trait in candidate.known_dealbreaker_traits:
        if trait in preference.non_negotiables:
            if trait in dangerous_non_negotiables:
                reasons.append(f"Candidate has dangerous non-negotiable trait: {trait}.")
                return {"status": "BLOCKED", "reasons": reasons, "soft_mismatches": soft_mismatches}

    status = "SOFT_MISMATCH" if soft_mismatches else "PASSED"
    return {"status": status, "reasons": reasons, "soft_mismatches": soft_mismatches}
