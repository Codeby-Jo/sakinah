from typing import Tuple
from nis.models.twenty_question_input import TwentyQuestionInput
from nis.engines.twenty_input_signal_engine import TwentyInputSignalEngine
from nis.models.user_profile import UserProfile
from nis.models.match_preference import MatchPreference

class TwentyInputProfileBuilder:
    """
    Builds the internal legacy UserProfile and MatchPreference models from the new 20-input system.
    Ensures that KYC/Backend fields are strictly sourced from SystemKycData to prevent spoofing.
    """

    @staticmethod
    def build_profiles(input_data: TwentyQuestionInput) -> Tuple[UserProfile, MatchPreference]:
        # 1. Derive deep signals
        signals = TwentyInputSignalEngine.derive_signals(input_data)
        
        # 2. Extract trusted backend/KYC context
        kyc = input_data.system_kyc
        
        # Determine verified overriding (if KYC verified, use KYC values, else fallback to user input)
        age = kyc.verified_age if kyc.verified_age else signals.get("age", 0)
        gender = kyc.verified_gender if kyc.verified_gender else signals.get("gender", "UNKNOWN")

        # 3. Build UserProfile (mapping derived signals + trusted KYC fields)
        user_profile = UserProfile(
            # Basic Demographics (Trusted over manual)
            user_id=kyc.user_id,
            name="User", # PII not strictly needed for matchmaking engine core
            age=age,
            gender=gender,
            location=signals.get("location", "UNKNOWN"),
            tradition=signals.get("religious_practice_level", "UNKNOWN"), # Approximation from practice
            height_cm=None, # Height was omitted from 20-question model explicitly
            marital_status=signals.get("marital_status", "NEVER_MARRIED"),
            education_level=signals.get("education_level", "NOT_SPECIFIED"),
            occupation=signals.get("occupation_category", "NOT_SPECIFIED"),
            work_outlook=signals.get("occupation_category", "UNKNOWN"),
            religious_practice_level=signals.get("religious_practice_level", "UNKNOWN"),
            islamic_environment_preference=signals.get("islamic_environment_preference", "UNKNOWN"),

            # Security / KYC (STRICTLY FROM BACKEND)
            is_verified=kyc.is_verified,
            is_banned=kyc.is_banned,
            has_required_data=True, # Implicitly true if it passed TwentyQuestionInput validation
            safety_status=kyc.safety_status,
            private_notes=None, # System only

            # Readiness & Lifestyle
            marriage_readiness=signals.get("marriage_readiness", "UNKNOWN"),
            emotional_steadiness=signals.get("emotional_steadiness", "UNKNOWN"),
            anger_level=signals.get("anger_level", "UNKNOWN"),
            repair_style=signals.get("repair_style", "UNKNOWN"),
            communication_style=signals.get("communication_style", "UNKNOWN"),
            attachment_style="UNKNOWN", # Derived from deeper models if needed later
            family_involvement=signals.get("family_involvement", "UNKNOWN"),
            family_pressure_level=signals.get("family_pressure_level", "UNKNOWN"),
            boundary_strength=signals.get("boundary_strength", "UNKNOWN"),
            financial_responsibility=signals.get("financial_responsibility", "UNKNOWN"),
            lifestyle_pattern=signals.get("lifestyle_pattern", "UNKNOWN"),

            # Psychology v2 Fields
            control_tendency=signals.get("control_tendency", "UNKNOWN"),
            empathy_level=signals.get("empathy_level", "UNKNOWN"),
            accountability_level=signals.get("accountability_level", "UNKNOWN"),
            humility_level="UNKNOWN",
            boundary_respect=signals.get("boundary_respect", "UNKNOWN"),
            manipulation_risk=signals.get("manipulation_risk", "UNKNOWN"),
            silent_treatment_pattern="UNKNOWN",
            gaslighting_risk="UNKNOWN",
            financial_control_tendency=signals.get("financial_control_tendency", "UNKNOWN"),
            family_pressure_misuse_risk="UNKNOWN",
            religious_control_risk=signals.get("religious_control_risk", "UNKNOWN"),
            possessiveness_level="UNKNOWN",
            isolation_tendency="UNKNOWN",
            decision_fairness=signals.get("decision_fairness", "UNKNOWN"),
            softness_level=signals.get("softness_level", "UNKNOWN"),
            assertiveness_level=signals.get("assertiveness_level", "UNKNOWN"),
            conflict_aggression_level="UNKNOWN",
            emotional_maturity="UNKNOWN"
        )

        # 4. Build MatchPreference (mapping derived preference signals)
        match_preference = MatchPreference(
            # Eligibility
            preferred_min_age=signals.get("preferred_age_min", 18),
            preferred_max_age=signals.get("preferred_age_max", 100),
            age_is_strict=False,
            preferred_min_height_cm=signals.get("preferred_min_height_cm"),
            preferred_max_height_cm=signals.get("preferred_max_height_cm"),
            height_is_strict=(signals.get("height_preference_strictness") == "STRICT"),
            preferred_marital_statuses=signals.get("preferred_marital_statuses", []),
            marital_status_is_strict=signals.get("marital_status_is_strict", False),
            preferred_locations=signals.get("preferred_locations", []),
            location_is_strict=(signals.get("location_flexibility") == "STRICT"),
            relocation_open=(signals.get("location_flexibility") == "FLEXIBLE"),

            # Faith/Tradition
            preferred_tradition=None,
            tradition_importance="LOW",
            religious_practice_importance=signals.get("preferred_religious_practice_level", "UNKNOWN"),
            preferred_islamic_environment=signals.get("preferred_islamic_environment", "UNKNOWN"),

            # Education/Career
            preferred_education_levels=signals.get("preferred_education_levels", []),
            education_is_strict=False,
            preferred_occupations=[],
            occupation_is_strict=False,
            preferred_work_outlook=signals.get("preferred_work_outlook", []),
            work_outlook_is_strict=False,
            financial_responsibility_expectation="UNKNOWN",

            # Family/Wali
            wali_involvement_timing=signals.get("wali_involvement_preference"),
            family_involvement_preference=signals.get("family_involvement"),
            family_expectations=[],
            family_boundaries_importance="UNKNOWN",
            wali_visibility_preference="UNKNOWN",

            # Lifestyle
            preferred_lifestyle_pattern=signals.get("lifestyle_pattern", "UNKNOWN"),
            preferred_daily_routine="UNKNOWN",
            preferred_living_arrangement="UNKNOWN",
            household_responsibility_preference="UNKNOWN",
            financial_lifestyle_preference="UNKNOWN",

            # Communication/Character
            communication_preference=signals.get("communication_style", "UNKNOWN"),
            conflict_style_preference="UNKNOWN",
            difficult_conflict_styles=[],
            important_character_traits=[],
            preferred_repair_style=signals.get("repair_style", "UNKNOWN"),

            # Blocks/Dealbreakers
            dealbreakers=signals.get("dealbreakers", []),
            non_negotiables=signals.get("dealbreakers", []), # Mapping strict dealbreakers to non_negotiables for hard filter safety
            flexible_preferences=[],
            custom_dealbreakers=[],

            # Safety/Privacy
            photo_visibility_comfort=None,
            in_app_communication_comfort=None,
            reportable_behaviors=[],

            # Review confirmations
            confirmed_honest_preferences=True,
            confirmed_no_match_over_wrong_match=True,
            confirmed_private_preferences_not_public=True,
            confirmed_raya_does_not_decide=True
        )

        return user_profile, match_preference
