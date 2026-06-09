from dataclasses import dataclass

@dataclass
class MatchResult:
    """
    Status values:
    SHOWN
    BLOCKED
    REVIEW_REQUIRED
    NO_MATCH
    ACTIVE_CONVERSATION_LIMIT_REACHED
    SEEKER_NOT_KYC_VERIFIED

    Privacy rules for safe_summary:
    `safe_summary` must never include private notes, raw identity data, 
    raw KYC data, spiritual/worship data, or compatibility percentage.
    
    All responses must include a `meta` dictionary with `source="NIS"` and `privacy_safe=True`.
    """
    candidate_id: str | None
    status: str
    reasons: list[str]
    safe_summary: dict
