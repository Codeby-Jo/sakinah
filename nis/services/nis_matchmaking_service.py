from nis.models.user_profile import UserProfile
from nis.models.match_preference import MatchPreference
from nis.models.candidate_profile import CandidateProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.engines import safety_engine, hard_filter_engine, preference_engine, psychology_engine, confidence_engine
from nis.engines.ranking_engine import calculate_internal_score, rank_candidates

class NISMatchmakingService:
    @staticmethod
    def generate_considered_few(
        current_user: UserProfile,
        match_preference: MatchPreference,
        candidates: list[CandidateProfile],
        pool_context: CandidatePoolContext | None = None
    ) -> dict:
        
        # 1. Validate current_user
        if pool_context and pool_context.active_conversations_count >= pool_context.max_active_conversations:
            return NISMatchmakingService._no_match_response(
                reason_category="ACTIVE_CONVERSATION_LIMIT_REACHED",
                custom_message="Continue your current conversation before receiving new candidates."
            )

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

        max_considered = 3
        if pool_context and getattr(pool_context, "max_considered_candidates", None) is not None:
            max_considered = pool_context.max_considered_candidates
            
        max_considered = max(1, min(5, max_considered))
        excluded_ids = set()
        if pool_context:
            excluded_ids.update(pool_context.shown_candidate_ids)
            excluded_ids.update(pool_context.passed_candidate_ids)
            excluded_ids.update(pool_context.blocked_candidate_ids)
            excluded_ids.update(pool_context.active_conversation_candidate_ids)

        failure_counts = {
            "unverified": 0,
            "safety": 0,
            "hard_filter": 0,
            "psychology": 0
        }
        evaluated_count = 0

        # 2. Loop through candidates
        for candidate in candidates:
            if candidate.candidate_id in excluded_ids:
                continue
                
            evaluated_count += 1
            
            if not candidate.profile.is_verified:
                failure_counts["unverified"] += 1
                # In some engine setups unverified might still run, but let's count it.

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
                # Calculate internal ranking score
                score = calculate_internal_score(p_res, psy_res)
            else:
                # Track failure reason
                if s_res.get("status") in ["BLOCKED", "REVIEW_REQUIRED"]:
                    failure_counts["safety"] += 1
                elif h_res.get("status") in ["BLOCKED"]:
                    failure_counts["hard_filter"] += 1
                elif psy_res.get("status") in ["BLOCKED"]:
                    failure_counts["psychology"] += 1
                elif c_res.get("status") == "NO_MATCH":
                    failure_counts["hard_filter"] += 1

                continue

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
                "safe_summary": safe_summary,
                "_private_score": score
            })

        # 7. If no candidates pass
        if not shown_candidates:
            if evaluated_count == 0:
                reason = "NO_ELIGIBLE_CANDIDATES"
            elif failure_counts["unverified"] > failure_counts["safety"] and failure_counts["unverified"] > failure_counts["hard_filter"]:
                reason = "INSUFFICIENT_VERIFIED_CANDIDATES"
            elif failure_counts["safety"] > failure_counts["hard_filter"] and failure_counts["safety"] > failure_counts["psychology"]:
                reason = "SAFETY_FILTERED_POOL"
            elif failure_counts["psychology"] > failure_counts["hard_filter"]:
                reason = "NO_PSYCHOLOGICALLY_SUITABLE_CANDIDATES"
            else:
                reason = "STRICT_PREFERENCES_TOO_NARROW"
                
            return NISMatchmakingService._no_match_response(reason_category=reason)
            
        # Rank and limit
        shown_candidates = rank_candidates(shown_candidates)
        shown_candidates = shown_candidates[:max_considered]
        
        # Remove private score
        for c in shown_candidates:
            c.pop("_private_score", None)
            
        # 8. If candidates pass
        return {
            "status": "HAS_CONSIDERED_CANDIDATES",
            "candidates": shown_candidates
        }
        
    @staticmethod
    def _no_match_response(reason_category: str = "NO_ELIGIBLE_CANDIDATES", custom_message: str = None) -> dict:
        msg = custom_message if custom_message else "No suitable matches right now. NIS prefers no match over a wrong match."
        status = reason_category if reason_category == "ACTIVE_CONVERSATION_LIMIT_REACHED" else "NO_SUITABLE_MATCHES_RIGHT_NOW"
        return {
            "status": status,
            "candidates": [],
            "reason_category": reason_category,
            "message": msg
        }
