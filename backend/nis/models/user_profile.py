from dataclasses import dataclass
from nis.models.enums import Gender, MaritalStatus, ReligiousPractice, MarriageReadiness, PsychologyState, CommunicationStyle, ConflictRepair, PsychologyLevel, EmotionalSafety, FinancialResponsibility

@dataclass
class UserProfile:
    # Basic
    user_id: str
    name: str
    age: int
    gender: Gender | str
    location: str
    tradition: str

    # New fields
    height_cm: int | None
    marital_status: MaritalStatus | str
    education_level: str | None
    occupation: str | None
    work_outlook: str | None
    religious_practice_level: ReligiousPractice | str | None
    islamic_environment_preference: ReligiousPractice | str | None

    # Existing psychology/readiness fields
    is_verified: bool
    is_banned: bool
    has_required_data: bool
    marriage_readiness: MarriageReadiness | str
    emotional_steadiness: PsychologyState | str
    anger_level: PsychologyLevel | str
    repair_style: ConflictRepair | str
    communication_style: CommunicationStyle | str
    attachment_style: str
    family_involvement: str
    family_pressure_level: PsychologyLevel | str
    boundary_strength: PsychologyLevel | str
    financial_responsibility: FinancialResponsibility | str
    lifestyle_pattern: str
    safety_status: str
    private_notes: str | None = None

    # Psychology v2 Fields
    control_tendency: PsychologyLevel | str = "UNKNOWN"
    empathy_level: PsychologyLevel | str = "UNKNOWN"
    accountability_level: PsychologyLevel | str = "UNKNOWN"
    humility_level: PsychologyLevel | str = "UNKNOWN"
    boundary_respect: EmotionalSafety | str = "UNKNOWN"
    manipulation_risk: PsychologyLevel | str = "UNKNOWN"
    silent_treatment_pattern: PsychologyLevel | str = "UNKNOWN"
    gaslighting_risk: PsychologyLevel | str = "UNKNOWN"
    financial_control_tendency: PsychologyLevel | str = "UNKNOWN"
    family_pressure_misuse_risk: PsychologyLevel | str = "UNKNOWN"
    religious_control_risk: PsychologyLevel | str = "UNKNOWN"
    possessiveness_level: PsychologyLevel | str = "UNKNOWN"
    isolation_tendency: PsychologyLevel | str = "UNKNOWN"
    decision_fairness: EmotionalSafety | str = "UNKNOWN"
    softness_level: PsychologyLevel | str = "UNKNOWN"
    assertiveness_level: PsychologyLevel | str = "UNKNOWN"
    conflict_aggression_level: PsychologyLevel | str = "UNKNOWN"
    emotional_maturity: PsychologyLevel | str = "UNKNOWN"
