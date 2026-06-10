from dataclasses import dataclass

@dataclass
class MutualInterestState:
    seeker_id: str
    candidate_id: str
    seeker_interested: bool = False
    candidate_interested: bool = False
    seeker_passed: bool = False
    candidate_passed: bool = False
