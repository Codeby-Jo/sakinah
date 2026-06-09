from dataclasses import dataclass
from nis.models.user_profile import UserProfile

@dataclass
class CandidateProfile:
    candidate_id: str
    profile: UserProfile
    known_dealbreaker_traits: list[str]
