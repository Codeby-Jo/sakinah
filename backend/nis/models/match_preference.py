from dataclasses import dataclass
from nis.models.enums import ReligiousPractice, PreferenceStrictness, CommunicationStyle, ConflictRepair

@dataclass
class MatchPreference:
    # Basic eligibility preferences
    preferred_min_age: int
    preferred_max_age: int
    age_is_strict: bool

    preferred_min_height_cm: int | None
    preferred_max_height_cm: int | None
    height_is_strict: bool

    preferred_marital_statuses: list[str]
    marital_status_is_strict: bool

    preferred_locations: list[str]
    location_is_strict: bool
    relocation_open: bool

    # Faith/tradition preferences
    preferred_tradition: str | None
    tradition_importance: PreferenceStrictness | str
    religious_practice_importance: ReligiousPractice | str | None
    preferred_islamic_environment: ReligiousPractice | str | None

    # Education/career preferences
    preferred_education_levels: list[str]
    education_is_strict: bool

    preferred_occupations: list[str]
    occupation_is_strict: bool

    preferred_work_outlook: list[str]
    work_outlook_is_strict: bool

    financial_responsibility_expectation: str | None

    # Family/wali preferences
    wali_involvement_timing: str | None
    family_involvement_preference: str | None
    family_expectations: list[str]
    family_boundaries_importance: str | None
    wali_visibility_preference: str | None

    # Lifestyle preferences
    preferred_lifestyle_pattern: str | None
    preferred_daily_routine: str | None
    preferred_living_arrangement: str | None
    household_responsibility_preference: str | None
    financial_lifestyle_preference: str | None

    # Communication/character preferences
    communication_preference: CommunicationStyle | str | None
    conflict_style_preference: ConflictRepair | str | None
    difficult_conflict_styles: list[str]
    important_character_traits: list[str]
    preferred_repair_style: ConflictRepair | str | None

    # Dealbreakers
    dealbreakers: list[str]
    non_negotiables: list[str]
    flexible_preferences: list[str]
    custom_dealbreakers: list[str]

    # Safety/privacy preferences
    photo_visibility_comfort: str | None
    in_app_communication_comfort: str | None
    reportable_behaviors: list[str]

    # Review confirmation
    confirmed_honest_preferences: bool
    confirmed_no_match_over_wrong_match: bool
    confirmed_private_preferences_not_public: bool
    confirmed_raya_does_not_decide: bool
