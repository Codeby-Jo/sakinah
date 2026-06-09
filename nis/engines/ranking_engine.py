def calculate_internal_score(preference_result: dict, psychology_result: dict) -> int:
    """
    Calculates an internal score based on the engine evaluation results.
    This score MUST NOT be exposed to the frontend/backend.
    """
    score = 0
    
    score += len(preference_result.get("soft_matches", [])) * 10
    score -= len(preference_result.get("serious_mismatches", [])) * 20
    score -= len(preference_result.get("soft_mismatches", [])) * 5
    
    score += len(psychology_result.get("healthy_complementarity", [])) * 15
    score -= len(psychology_result.get("dangerous_dynamics", [])) * 25
    
    return score

def rank_candidates(candidates_with_scores: list[dict]) -> list[dict]:
    """
    Sorts candidates based on internal private scores.
    Expects a list of dictionaries where each dict has a "_private_score" key.
    Higher score is better.
    """
    return sorted(candidates_with_scores, key=lambda c: c.get("_private_score", 0), reverse=True)
