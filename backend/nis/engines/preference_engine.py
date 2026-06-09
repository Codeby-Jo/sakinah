from nis.models.candidate_profile import CandidateProfile
from nis.models.match_preference import MatchPreference

def evaluate_preferences(candidate: CandidateProfile, preference: MatchPreference) -> dict:
    soft_matches = []
    soft_mismatches = []
    serious_mismatches = []
    notes = []

    def check_mismatch(field_name, cand_val, pref_val, flex_key):
        if not pref_val: return
        # Handle lists vs strings
        if isinstance(pref_val, list):
            match = cand_val in pref_val
        else:
            match = (cand_val == pref_val)
            
        if match:
            soft_matches.append(f"{field_name} preference met.")
        else:
            if flex_key in preference.flexible_preferences:
                notes.append(f"{field_name} differs, but marked as flexible.")
            else:
                soft_mismatches.append(f"{field_name} preference not met.")

    # Apply soft evaluation checks
    if not preference.location_is_strict:
        check_mismatch("Location", candidate.profile.location, preference.preferred_locations, "location")
    if not preference.height_is_strict:
        if preference.preferred_min_height_cm and preference.preferred_max_height_cm and candidate.profile.height_cm:
            if preference.preferred_min_height_cm <= candidate.profile.height_cm <= preference.preferred_max_height_cm:
                soft_matches.append("Height preference met.")
            else:
                if "height" in preference.flexible_preferences:
                    notes.append("Height differs, but marked as flexible.")
                else:
                    soft_mismatches.append("Height preference not met.")
    if not preference.marital_status_is_strict:
        check_mismatch("Marital status", candidate.profile.marital_status, preference.preferred_marital_statuses, "marital_status")
    
    # Tradition
    if preference.tradition_importance != "REQUIRED":
        if preference.tradition_importance == "PREFERRED" and candidate.profile.tradition != preference.preferred_tradition:
            soft_mismatches.append("Tradition preference not met.")
        elif preference.tradition_importance in ["FLEXIBLE", "NOT_SURE"] and candidate.profile.tradition != preference.preferred_tradition:
            notes.append("Tradition differs, but user is flexible.")
        elif candidate.profile.tradition == preference.preferred_tradition:
            soft_matches.append("Tradition preference met.")

    check_mismatch("Religious practice", candidate.profile.religious_practice_level, preference.religious_practice_importance, "religious_practice")
    check_mismatch("Islamic home environment", candidate.profile.islamic_environment_preference, preference.preferred_islamic_environment, "islamic_environment")
    
    if not preference.education_is_strict:
        check_mismatch("Education", candidate.profile.education_level, preference.preferred_education_levels, "education")
    if not preference.occupation_is_strict:
        check_mismatch("Occupation", candidate.profile.occupation, preference.preferred_occupations, "occupation")
    if not preference.work_outlook_is_strict:
        check_mismatch("Work outlook", candidate.profile.work_outlook, preference.preferred_work_outlook, "work_outlook")

    check_mismatch("Financial responsibility expectation", candidate.profile.financial_responsibility, preference.financial_responsibility_expectation, "financial_responsibility")
    check_mismatch("Family involvement", candidate.profile.family_involvement, preference.family_involvement_preference, "family_involvement")
    
    if preference.family_expectations:
        notes.append("Candidate should be informed of family expectations.")
        
    check_mismatch("Family boundaries", candidate.profile.boundary_strength, preference.family_boundaries_importance, "family_boundaries")
    
    check_mismatch("Lifestyle pattern", candidate.profile.lifestyle_pattern, preference.preferred_lifestyle_pattern, "lifestyle_pattern")
    check_mismatch("Daily routine", candidate.profile.lifestyle_pattern, preference.preferred_daily_routine, "daily_routine")
    check_mismatch("Living arrangement", candidate.profile.location, preference.preferred_living_arrangement, "living_arrangement")
    check_mismatch("Household responsibility", candidate.profile.lifestyle_pattern, preference.household_responsibility_preference, "household_responsibility")
    check_mismatch("Financial lifestyle", candidate.profile.financial_responsibility, preference.financial_lifestyle_preference, "financial_lifestyle")

    check_mismatch("Communication", candidate.profile.communication_style, preference.communication_preference, "communication")
    check_mismatch("Conflict style", candidate.profile.anger_level, preference.conflict_style_preference, "conflict_style")
    check_mismatch("Repair style", candidate.profile.repair_style, preference.preferred_repair_style, "repair_style")

    if preference.difficult_conflict_styles and candidate.profile.anger_level in preference.difficult_conflict_styles:
        soft_mismatches.append("Candidate uses a conflict style the user finds difficult.")
        
    if preference.important_character_traits:
        notes.append("Character traits are evaluated qualitatively.")

    if preference.photo_visibility_comfort or preference.in_app_communication_comfort or preference.reportable_behaviors:
        notes.append("Privacy and safety preferences acknowledged.")

    # Non-negotiables
    for trait in candidate.known_dealbreaker_traits:
        if trait in preference.non_negotiables:
            serious_mismatches.append(f"Candidate possesses non-negotiable trait: {trait}.")

    return {
        "soft_matches": soft_matches,
        "soft_mismatches": soft_mismatches,
        "serious_mismatches": serious_mismatches,
        "notes": notes
    }
