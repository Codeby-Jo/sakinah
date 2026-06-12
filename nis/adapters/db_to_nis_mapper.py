from nis.models.user_profile import UserProfile
from nis.models.candidate_profile import CandidateProfile
from nis.models.match_preference import MatchPreference
from nis.adapters.psychology_parser import parse_psychology_responses

def map_db_user_to_user_profile(db_user: dict) -> UserProfile:
    gender = db_user.get("gender")
    if gender:
        gender = gender.upper()
        
    # Run the translator on the raw profile object!
    psy_prof_obj = db_user.get("_raw_psychological_profile")
    metrics = parse_psychology_responses(psy_prof_obj)
    
    # Allow overriding metrics from db_user dict (for testing/direct assignment)
    metrics["control_tendency"] = db_user.get("control_tendency", metrics["control_tendency"])
    metrics["empathy_level"] = db_user.get("empathy_level", metrics["empathy_level"])
    metrics["accountability_level"] = db_user.get("accountability_level", metrics["accountability_level"])
    metrics["humility_level"] = db_user.get("humility_level", metrics["humility_level"])
    metrics["boundary_respect"] = db_user.get("boundary_respect", metrics["boundary_respect"])
    metrics["manipulation_risk"] = db_user.get("manipulation_risk", metrics["manipulation_risk"])
    metrics["silent_treatment_pattern"] = db_user.get("silent_treatment_pattern", metrics["silent_treatment_pattern"])
    metrics["gaslighting_risk"] = db_user.get("gaslighting_risk", metrics["gaslighting_risk"])
    metrics["financial_control_tendency"] = db_user.get("financial_control_tendency", metrics["financial_control_tendency"])
    metrics["family_pressure_misuse_risk"] = db_user.get("family_pressure_misuse_risk", metrics["family_pressure_misuse_risk"])
    metrics["religious_control_risk"] = db_user.get("religious_control_risk", metrics["religious_control_risk"])
    metrics["possessiveness_level"] = db_user.get("possessiveness_level", metrics["possessiveness_level"])
    metrics["isolation_tendency"] = db_user.get("isolation_tendency", metrics["isolation_tendency"])
    metrics["decision_fairness"] = db_user.get("decision_fairness", metrics["decision_fairness"])
    metrics["softness_level"] = db_user.get("softness_level", metrics["softness_level"])
    metrics["assertiveness_level"] = db_user.get("assertiveness_level", metrics["assertiveness_level"])
    metrics["conflict_aggression_level"] = db_user.get("conflict_aggression_level", metrics["conflict_aggression_level"])
    metrics["emotional_maturity"] = db_user.get("emotional_maturity", metrics["emotional_maturity"])
        
    return UserProfile(
        user_id=db_user.get("user_id"),
        name=db_user.get("name"),
        age=db_user.get("age", 0),
        gender=gender,
        location=db_user.get("location"),
        tradition=db_user.get("tradition"),
        height_cm=db_user.get("height_cm"),
        marital_status=db_user.get("marital_status"),
        education_level=db_user.get("education_level"),
        occupation=db_user.get("occupation"),
        work_outlook=db_user.get("work_outlook"),
        religious_practice_level=db_user.get("religious_practice_level"),
        islamic_environment_preference=db_user.get("islamic_environment_preference"),
        is_verified=db_user.get("is_verified", False),
        is_banned=db_user.get("is_banned", False),
        has_required_data=db_user.get("has_required_data", False),
        marriage_readiness=db_user.get("marriage_readiness"),
        emotional_steadiness=db_user.get("emotional_steadiness"),
        anger_level=db_user.get("anger_level"),
        repair_style=db_user.get("repair_style"),
        communication_style=db_user.get("communication_style"),
        attachment_style=db_user.get("attachment_style"),
        family_involvement=db_user.get("family_involvement"),
        family_pressure_level=db_user.get("family_pressure_level"),
        boundary_strength=db_user.get("boundary_strength"),
        financial_responsibility=db_user.get("financial_responsibility"),
        lifestyle_pattern=db_user.get("lifestyle_pattern"),
        safety_status=db_user.get("safety_status"),
        private_notes=db_user.get("private_notes"),
        control_tendency=metrics["control_tendency"],
        empathy_level=metrics["empathy_level"],
        accountability_level=metrics["accountability_level"],
        humility_level=metrics["humility_level"],
        boundary_respect=metrics["boundary_respect"],
        manipulation_risk=metrics["manipulation_risk"],
        silent_treatment_pattern=metrics["silent_treatment_pattern"],
        gaslighting_risk=metrics["gaslighting_risk"],
        financial_control_tendency=metrics["financial_control_tendency"],
        family_pressure_misuse_risk=metrics["family_pressure_misuse_risk"],
        religious_control_risk=metrics["religious_control_risk"],
        possessiveness_level=metrics["possessiveness_level"],
        isolation_tendency=metrics["isolation_tendency"],
        decision_fairness=metrics["decision_fairness"],
        softness_level=metrics["softness_level"],
        assertiveness_level=metrics["assertiveness_level"],
        conflict_aggression_level=metrics["conflict_aggression_level"],
        emotional_maturity=metrics["emotional_maturity"]
    )

def map_db_candidate_to_candidate_profile(db_candidate: dict) -> CandidateProfile:
    profile_dict = db_candidate.get("profile", db_candidate)
    profile = map_db_user_to_user_profile(profile_dict)
    
    known_dealbreaker_traits = db_candidate.get("known_dealbreaker_traits", [])
    
    return CandidateProfile(
        candidate_id=db_candidate.get("candidate_id") or profile.user_id,
        profile=profile,
        known_dealbreaker_traits=known_dealbreaker_traits
    )

def map_db_preference_to_match_preference(db_preference: dict) -> MatchPreference:
    return MatchPreference(
        preferred_min_age=db_preference.get("preferred_min_age", 18),
        preferred_max_age=db_preference.get("preferred_max_age", 100),
        age_is_strict=db_preference.get("age_is_strict", False),
        preferred_min_height_cm=db_preference.get("preferred_min_height_cm"),
        preferred_max_height_cm=db_preference.get("preferred_max_height_cm"),
        height_is_strict=db_preference.get("height_is_strict", False),
        preferred_marital_statuses=db_preference.get("preferred_marital_statuses", []),
        marital_status_is_strict=db_preference.get("marital_status_is_strict", False),
        preferred_locations=db_preference.get("preferred_locations", []),
        location_is_strict=db_preference.get("location_is_strict", False),
        relocation_open=db_preference.get("relocation_open", False),
        preferred_tradition=db_preference.get("preferred_tradition"),
        tradition_importance="REQUIRED" if db_preference.get("tradition_is_strict") else "LOW",
        religious_practice_importance=db_preference.get("religious_practice_importance"),
        preferred_islamic_environment=db_preference.get("preferred_islamic_environment"),
        preferred_education_levels=db_preference.get("preferred_education_levels", []),
        education_is_strict=db_preference.get("education_is_strict", False),
        preferred_occupations=db_preference.get("preferred_occupations", []),
        occupation_is_strict=db_preference.get("occupation_is_strict", False),
        preferred_work_outlook=db_preference.get("preferred_work_outlook", []),
        work_outlook_is_strict=db_preference.get("work_outlook_is_strict", False),
        financial_responsibility_expectation=db_preference.get("financial_responsibility_expectation"),
        wali_involvement_timing=db_preference.get("wali_involvement_timing"),
        family_involvement_preference=db_preference.get("family_involvement_preference"),
        family_expectations=db_preference.get("family_expectations", []),
        family_boundaries_importance=db_preference.get("family_boundaries_importance"),
        wali_visibility_preference=db_preference.get("wali_visibility_preference"),
        preferred_lifestyle_pattern=db_preference.get("preferred_lifestyle_pattern"),
        preferred_daily_routine=db_preference.get("preferred_daily_routine"),
        preferred_living_arrangement=db_preference.get("preferred_living_arrangement"),
        household_responsibility_preference=db_preference.get("household_responsibility_preference"),
        financial_lifestyle_preference=db_preference.get("financial_lifestyle_preference"),
        communication_preference=db_preference.get("communication_preference"),
        conflict_style_preference=db_preference.get("conflict_style_preference"),
        difficult_conflict_styles=db_preference.get("difficult_conflict_styles", []),
        important_character_traits=db_preference.get("important_character_traits", []),
        preferred_repair_style=db_preference.get("preferred_repair_style"),
        dealbreakers=db_preference.get("dealbreakers", []),
        non_negotiables=db_preference.get("non_negotiables", []),
        flexible_preferences=db_preference.get("flexible_preferences", []),
        custom_dealbreakers=db_preference.get("custom_dealbreakers", []),
        photo_visibility_comfort=db_preference.get("photo_visibility_comfort"),
        in_app_communication_comfort=db_preference.get("in_app_communication_comfort"),
        reportable_behaviors=db_preference.get("reportable_behaviors", []),
        confirmed_honest_preferences=db_preference.get("confirmed_honest_preferences", False),
        confirmed_no_match_over_wrong_match=db_preference.get("confirmed_no_match_over_wrong_match", False),
        confirmed_private_preferences_not_public=db_preference.get("confirmed_private_preferences_not_public", False),
        confirmed_raya_does_not_decide=db_preference.get("confirmed_raya_does_not_decide", False)
    )
