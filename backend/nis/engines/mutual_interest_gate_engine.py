from nis.models.mutual_interest_state import MutualInterestState

def evaluate_mutual_interest_gate(state: MutualInterestState) -> dict:
    if state.seeker_passed or state.candidate_passed:
        return {
            "status": "CLOSED_SILENTLY",
            "message": "Interest gate closed silently."
        }
        
    if state.seeker_interested and state.candidate_interested:
        return {
            "status": "MUTUAL_INTEREST_CONFIRMED",
            "message": "Mutual interest confirmed."
        }
        
    return {
        "status": "WAITING_FOR_MUTUAL_INTEREST",
        "message": "Awaiting interest."
    }
