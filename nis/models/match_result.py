from dataclasses import dataclass

@dataclass
class MatchResult:
    """
    Status values:
    SHOWN
    BLOCKED
    REVIEW_REQUIRED
    NO_MATCH

    Privacy rules for safe_summary:
    `safe_summary` must never include private notes, raw identity data, 
    raw KYC data, spiritual/worship data, or compatibility percentage.
    """
    candidate_id: str | None
    status: str
    reasons: list[str]
    safe_summary: dict
