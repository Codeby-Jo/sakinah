from dataclasses import dataclass, field

@dataclass
class CandidatePoolContext:
    seeker_id: str
    active_conversations_count: int = 0
    max_active_conversations: int = 2
    shown_candidate_ids: list[str] = field(default_factory=list)
    passed_candidate_ids: list[str] = field(default_factory=list)
    blocked_candidate_ids: list[str] = field(default_factory=list)
    active_conversation_candidate_ids: list[str] = field(default_factory=list)
    max_considered_candidates: int = 10
    batch_number: int = 1
    batch_size: int = 10
    max_batch_size: int = 10
