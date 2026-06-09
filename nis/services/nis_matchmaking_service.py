from nis.models.user_profile import UserProfile
from nis.models.match_preference import MatchPreference
from nis.models.candidate_profile import CandidateProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.engines import safety_engine, hard_filter_engine, preference_engine, psychology_engine, confidence_engine

class NISMatchmakingService:
    @staticmethod
    def generate_considered_few(
        current_user: UserProfile,
        match_preference: MatchPreference,
        candidates: list[CandidateProfile],
        pool_context: CandidatePoolContext | None = None
    ) -> dict:
        
        # 1. Validate current_user
        if not current_user.gender or current_user.gender not in ["MALE", "FEMALE"]:
            return NISMatchmakingService._no_match_response()
        if not current_user.has_required_data:
            return NISMatchmakingService._no_match_response()
        if current_user.is_banned:
            return NISMatchmakingService._no_match_response()
        if not current_user.is_verified:
            return NISMatchmakingService._no_match_response()
        if current_user.safety_status in ("BLOCKED", "UNDER_REVIEW"):
            return NISMatchmakingService._no_match_response()

        shown_candidates = []

        max_considered = pool_context.max_considered_candidates if pool_context else 5
        excluded_ids = set()
        if pool_context:
            excluded_ids.update(pool_context.shown_candidate_ids)
            excluded_ids.update(pool_context.passed_candidate_ids)
            excluded_ids.update(pool_context.blocked_candidate_ids)
            excluded_ids.update(pool_context.active_conversation_candidate_ids)

        # 2. Loop through candidates
        for candidate in candidates:
            if candidate.candidate_id in excluded_ids:
                continue

            # 6. Limit final considered candidates to maximum
            if len(shown_candidates) >= max_considered:
                break
                
            # 3. Run engines
            s_res = safety_engine.evaluate_safety(candidate)
            h_res = hard_filter_engine.evaluate_hard_filters(current_user, candidate, match_preference)
            p_res = preference_engine.evaluate_preferences(candidate, match_preference)
            psy_res = psychology_engine.evaluate_psychology(current_user, candidate)
            
            c_res = confidence_engine.decide_visibility(
                safety_result=s_res,
                hard_filter_result=h_res,
                preference_result=p_res,
                psychology_result=psy_res
            )
            
            # 4. Add only candidates where final decision status is SHOWN
            if c_res.get("status") == "SHOWN":
                # Privacy-safe output: no private notes, no identity data, no scores
                safe_summary = {
                    "location": candidate.profile.location,
                    "tradition": candidate.profile.tradition,
                    "readiness": candidate.profile.marriage_readiness,
                    "communication_note": f"Communication style is {candidate.profile.communication_style.lower()}"
                }
                
                shown_candidates.append({
                    "candidate_id": candidate.candidate_id,
                    "status": "SHOWN",
                    "reasons": c_res.get("reasons", []),
                    "safe_summary": safe_summary
                })

        # 7. If no candidates pass
        if not shown_candidates:
            return NISMatchmakingService._no_match_response()
            
        # 8. If candidates pass
        return {
            "status": "HAS_CONSIDERED_CANDIDATES",
            "candidates": shown_candidates
        }
        
    @staticmethod
    def _no_match_response() -> dict:
        return {
            "status": "NO_SUITABLE_MATCHES_RIGHT_NOW",
            "candidates": [],
            "message": "No suitable matches right now. NIS prefers no match over a wrong match."
        }
