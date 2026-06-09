from dataclasses import dataclass

@dataclass
class UserProfile:
    # Basic
    user_id: str
    name: str
    age: int
    gender: str
    location: str
    tradition: str

    # New fields
    height_cm: int | None
    marital_status: str
    education_level: str | None
    occupation: str | None
    work_outlook: str | None
    religious_practice_level: str | None
    islamic_environment_preference: str | None

    # Existing psychology/readiness fields
    is_verified: bool
    is_banned: bool
    has_required_data: bool
    marriage_readiness: str
    emotional_steadiness: str
    anger_level: str
    repair_style: str
    communication_style: str
    attachment_style: str
    family_involvement: str
    family_pressure_level: str
    boundary_strength: str
    financial_responsibility: str
    lifestyle_pattern: str
    safety_status: str
    private_notes: str | None = None
