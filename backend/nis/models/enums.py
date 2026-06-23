from enum import Enum

class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    UNKNOWN = "UNKNOWN"

class MaritalStatus(str, Enum):
    NEVER_MARRIED = "NEVER_MARRIED"
    DIVORCED = "DIVORCED"
    WIDOWED = "WIDOWED"
    NO_STRICT_PREFERENCE = "NO_STRICT_PREFERENCE"

class ReligiousPractice(str, Enum):
    PRACTICING = "PRACTICING"
    MODERATE = "MODERATE"
    STRICT = "STRICT"
    FLEXIBLE = "FLEXIBLE"
    UNKNOWN = "UNKNOWN"

class MarriageReadiness(str, Enum):
    READY = "READY"
    NOT_READY = "NOT_READY"
    UNKNOWN = "UNKNOWN"

class PreferenceStrictness(str, Enum):
    STRICT = "STRICT"
    FLEXIBLE = "FLEXIBLE"

class CommunicationStyle(str, Enum):
    OPEN = "OPEN"
    CALM = "CALM"
    AVOIDANT = "AVOIDANT"
    SILENT = "SILENT"
    CONFLICT_AVOIDANT = "CONFLICT_AVOIDANT"
    UNKNOWN = "UNKNOWN"

class ConflictRepair(str, Enum):
    ACCOUNTABLE = "ACCOUNTABLE"
    HEALTHY = "HEALTHY"
    CONTROLLING = "CONTROLLING"
    AGGRESSIVE = "AGGRESSIVE"
    UNCLEAR = "UNCLEAR"
    UNKNOWN = "UNKNOWN"

class EmotionalSafety(str, Enum):
    RESPECTFUL = "RESPECTFUL"
    SAFE = "SAFE"
    EMPATHETIC = "EMPATHETIC"
    FAIR = "FAIR"
    INDEPENDENT = "INDEPENDENT"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"

class FinancialResponsibility(str, Enum):
    CONTROLLING = "CONTROLLING"
    RESPONSIBLE = "RESPONSIBLE"
    UNKNOWN = "UNKNOWN"

class PsychologyLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"

class PsychologyState(str, Enum):
    STEADY = "STEADY"
    MODERATE = "MODERATE"
    UNKNOWN = "UNKNOWN"
