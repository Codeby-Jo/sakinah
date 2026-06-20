from dataclasses import dataclass, field
from typing import Any, List, Dict, Optional

@dataclass
class InputField:
    field_name: str
    is_required: bool
    safe_default: Any
    derived_signal_targets: List[str]
    answer_code: Optional[str] = None
    answer_value: Any = None
    
    @property
    def resolved_value(self) -> Any:
        val = self.answer_value if self.answer_value is not None else self.answer_code
        if val is None:
            if self.is_required:
                raise ValueError(f"Missing required field: {self.field_name}")
            return self.safe_default
        return val

@dataclass
class SystemKycData:
    """Backend/KYC system fields. Not user-provided."""
    user_id: str
    is_verified: bool = False
    verified_gender: Optional[str] = None
    verified_age: Optional[int] = None
    safety_status: str = "PENDING"
    is_banned: bool = False
    known_dealbreaker_traits: List[str] = field(default_factory=list)

class TwentyQuestionInput:
    """
    The final 20-question input model.
    Accepts exactly 20 crisp answers from the frontend and strict backend KYC data.
    """
    def __init__(self, raw_answers: Dict[str, Any], system_kyc: SystemKycData):
        self.system_kyc = system_kyc
        
        # 1. Basic age / birth year
        self.age = InputField(
            field_name="age", is_required=True, safe_default=None,
            derived_signal_targets=["user_profile.age"],
            answer_value=raw_answers.get("age")
        )
        
        # 2. Gender
        self.gender = InputField(
            field_name="gender", is_required=True, safe_default=None,
            derived_signal_targets=["user_profile.gender"],
            answer_code=raw_answers.get("gender")
        )
        
        # 3. Location
        self.location = InputField(
            field_name="location", is_required=True, safe_default=None,
            derived_signal_targets=["user_profile.location"],
            answer_value=raw_answers.get("location")
        )
        
        # 4. Marital status
        self.marital_status = InputField(
            field_name="marital_status", is_required=False, safe_default="NEVER_MARRIED",
            derived_signal_targets=["user_profile.marital_status"],
            answer_code=raw_answers.get("marital_status")
        )
        
        # 5. Education / occupation
        self.education_occupation = InputField(
            field_name="education_occupation", is_required=False, safe_default="NOT_SPECIFIED",
            derived_signal_targets=["user_profile.education_level", "user_profile.occupation"],
            answer_code=raw_answers.get("education_occupation")
        )
        
        # 6. Religious practice and Islamic home preference
        self.religious_practice_and_islamic_home = InputField(
            field_name="religious_practice_and_islamic_home", is_required=True, safe_default=None,
            derived_signal_targets=["user_profile.religious_practice_level", "user_profile.tradition", "user_profile.islamic_environment_preference"],
            answer_code=raw_answers.get("religious_practice_and_islamic_home")
        )
        
        # 8. Marriage readiness
        self.marriage_readiness = InputField(
            field_name="marriage_readiness", is_required=True, safe_default=None,
            derived_signal_targets=["user_profile.marriage_readiness"],
            answer_code=raw_answers.get("marriage_readiness")
        )
        
        # 9. Preferred candidate age range
        self.pref_age_range = InputField(
            field_name="pref_age_range", is_required=False, safe_default={"min": 18, "max": 100},
            derived_signal_targets=["match_preference.preferred_min_age", "match_preference.preferred_max_age"],
            answer_value=raw_answers.get("pref_age_range")
        )
        
        # 10. Preferred location flexibility
        self.pref_location = InputField(
            field_name="pref_location", is_required=False, safe_default=[],
            derived_signal_targets=["match_preference.preferred_locations", "match_preference.location_is_strict"],
            answer_value=raw_answers.get("pref_location")
        )
        
        # 11. Preferred marital status
        self.pref_marital_status = InputField(
            field_name="pref_marital_status", is_required=False, safe_default="NO_STRICT_PREFERENCE",
            derived_signal_targets=["match_preference.preferred_marital_statuses", "match_preference.marital_status_is_strict"],
            answer_code=raw_answers.get("pref_marital_status")
        )
        
        # 12. Preferred height or physical preference
        self.pref_height_or_physical_preference = InputField(
            field_name="pref_height_or_physical_preference", is_required=False, safe_default="NO_STRICT_HEIGHT_PREFERENCE",
            derived_signal_targets=["match_preference.preferred_min_height_cm", "match_preference.preferred_max_height_cm", "match_preference.height_is_strict"],
            answer_value=raw_answers.get("pref_height_or_physical_preference")
        )
        
        # 11. Preferred religious / Islamic home alignment
        self.pref_religious_alignment = InputField(
            field_name="pref_religious_alignment", is_required=False, safe_default="FLEXIBLE",
            derived_signal_targets=["match_preference.religious_practice_importance", "match_preference.preferred_islamic_environment"],
            answer_code=raw_answers.get("pref_religious_alignment")
        )
        
        # 12. Preferred education / work outlook
        self.pref_education_work = InputField(
            field_name="pref_education_work", is_required=False, safe_default=[],
            derived_signal_targets=["match_preference.preferred_education_levels", "match_preference.preferred_work_outlook"],
            answer_value=raw_answers.get("pref_education_work")
        )
        
        # 13. Family and wali involvement
        self.family_wali_involvement = InputField(
            field_name="family_wali_involvement", is_required=False, safe_default="STANDARD",
            derived_signal_targets=["match_preference.family_involvement_preference", "match_preference.wali_involvement_timing"],
            answer_code=raw_answers.get("family_wali_involvement")
        )
        
        # 14. Marriage timeline
        self.marriage_timeline = InputField(
            field_name="marriage_timeline", is_required=False, safe_default="FLEXIBLE",
            derived_signal_targets=["user_profile.lifestyle_pattern"], # Could map to timeline
            answer_code=raw_answers.get("marriage_timeline")
        )
        
        # 15. Strict dealbreakers
        self.strict_dealbreakers = InputField(
            field_name="strict_dealbreakers", is_required=False, safe_default=[],
            derived_signal_targets=["match_preference.dealbreakers", "match_preference.non_negotiables"],
            answer_value=raw_answers.get("strict_dealbreakers")
        )
        
        # 16. Communication style
        self.communication_style = InputField(
            field_name="communication_style", is_required=False, safe_default="UNKNOWN",
            derived_signal_targets=["user_profile.communication_style", "match_preference.communication_preference"],
            answer_code=raw_answers.get("communication_style")
        )
        
        # 17. Conflict and repair style
        self.conflict_repair = InputField(
            field_name="conflict_repair", is_required=False, safe_default="UNKNOWN",
            derived_signal_targets=["user_profile.anger_level", "user_profile.repair_style", "user_profile.conflict_aggression_level", "user_profile.control_tendency"],
            answer_code=raw_answers.get("conflict_repair")
        )
        
        # 19. Boundary, family pressure, and emotional safety
        self.boundary_emotional_safety = InputField(
            field_name="boundary_emotional_safety", is_required=False, safe_default="UNKNOWN",
            derived_signal_targets=["user_profile.boundary_strength", "user_profile.boundary_respect", "user_profile.manipulation_risk", "user_profile.gaslighting_risk", "user_profile.family_pressure_level", "user_profile.decision_fairness", "user_profile.family_pressure_misuse_risk"],
            answer_code=raw_answers.get("boundary_emotional_safety")
        )
        
        # 20. Lifestyle and financial responsibility
        self.lifestyle_finances = InputField(
            field_name="lifestyle_finances", is_required=False, safe_default="UNKNOWN",
            derived_signal_targets=["user_profile.financial_responsibility", "match_preference.financial_responsibility_expectation", "user_profile.financial_control_tendency"],
            answer_code=raw_answers.get("lifestyle_finances")
        )

    def validate(self) -> bool:
        """
        Validates the model. Raises ValueError if a required field is missing.
        Accessing .resolved_value on each field implicitly checks this.
        """
        fields = [
            self.age, self.gender, self.location, self.marital_status,
            self.education_occupation, self.religious_practice_and_islamic_home,
            self.marriage_readiness, self.pref_age_range, self.pref_location,
            self.pref_marital_status, self.pref_height_or_physical_preference,
            self.pref_religious_alignment, self.pref_education_work,
            self.family_wali_involvement, self.marriage_timeline,
            self.strict_dealbreakers, self.communication_style,
            self.conflict_repair, self.boundary_emotional_safety,
            self.lifestyle_finances
        ]
        
        for f in fields:
            _ = f.resolved_value # Will raise exception if required and missing
            
        return True
