from nis.models.user_profile import UserProfile
from nis.models.match_preference import MatchPreference
from nis.models.candidate_profile import CandidateProfile
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.engines import safety_engine, hard_filter_engine, preference_engine, psychology_engine, confidence_engine
from nis.engines.ranking_engine import calculate_internal_score, rank_candidates
from nis.engines.human_review_trigger_engine import evaluate_human_review_trigger

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
                custom_message="Continue your current conversation before receiving new candidates.",
                max_candidates=pool_context.max_considered_candidates if pool_context else 3
            )

        if not current_user.gender or current_user.gender not in ["MALE", "FEMALE"]:
            return NISMatchmakingService._no_match_response(max_candidates=pool_context.max_considered_candidates if pool_context else 3)
        if not current_user.has_required_data:
            return NISMatchmakingService._no_match_response(max_candidates=pool_context.max_considered_candidates if pool_context else 3)
        if current_user.is_banned:
            return NISMatchmakingService._no_match_response(max_candidates=pool_context.max_considered_candidates if pool_context else 3)
        if current_user.is_verified is not True:
            return {
                "status": "SEEKER_NOT_KYC_VERIFIED",
                "candidates": [],
                "message": "KYC verification is required before matchmaking can begin.",
                "meta": {
                    "source": "NIS",
                    "privacy_safe": True
                }
            }
        if current_user.safety_status in ("BLOCKED", "UNDER_REVIEW"):
            return NISMatchmakingService._no_match_response(max_candidates=pool_context.max_considered_candidates if pool_context else 3)

        shown_candidates = []

        batch_number = 1
        batch_size = 10
        if pool_context:
            if getattr(pool_context, "batch_number", None) is not None:
                batch_number = max(1, pool_context.batch_number)
            if getattr(pool_context, "batch_size", None) is not None:
                batch_size = max(1, min(10, pool_context.batch_size))
        
        offset = (batch_number - 1) * batch_size
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

            safe_summary = {
                "location": candidate.profile.location,
                "tradition": candidate.profile.tradition,
                "readiness": candidate.profile.marriage_readiness,
                "communication_note": f"Communication style is {candidate.profile.communication_style.lower()}"
            }
            
            review_status = evaluate_human_review_trigger(candidate.profile)
            
            cand_dict = {
                "candidate_id": candidate.candidate_id,
                "status": "SHOWN",
                "reasons": c_res.get("reasons", []),
                "safe_summary": safe_summary,
                "_private_score": score
            }
            
            if review_status.get("requires_human_review"):
                cand_dict["_requires_human_review"] = True
                cand_dict["_review_category"] = review_status.get("review_category")
                
            shown_candidates.append(cand_dict)

        # 7. If no candidates pass
        if not shown_candidates:
            if batch_number > 1:
                return {
                    "status": "NO_MORE_CANDIDATES_IN_THIS_BATCH",
                    "candidates": [],
                    "message": "No more suitable candidates are available right now.",
                    "meta": {
                        "source": "NIS",
                        "privacy_safe": True
                    }
                }
            
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
                
            return NISMatchmakingService._no_match_response(reason_category=reason, max_candidates=batch_size)
            
        # Rank and limit
        shown_candidates = rank_candidates(shown_candidates)
        
        start_idx = offset
        end_idx = offset + batch_size
        has_next_batch = len(shown_candidates) > end_idx
        
        shown_candidates = shown_candidates[start_idx:end_idx]
        
        if not shown_candidates and batch_number > 1:
            return {
                "status": "NO_MORE_CANDIDATES_IN_THIS_BATCH",
                "candidates": [],
                "message": "No more suitable candidates are available right now.",
                "meta": {
                    "source": "NIS",
                    "privacy_safe": True
                }
            }
        
        # Remove private score
        for c in shown_candidates:
            c.pop("_private_score", None)
            
        # 8. If candidates pass
        return {
            "status": "HAS_CONSIDERED_CANDIDATES",
            "candidates": shown_candidates,
            "meta": {
                "max_candidates": batch_size,
                "source": "NIS",
                "privacy_safe": True,
                "batch": {
                    "batch_number": batch_number,
                    "batch_size": len(shown_candidates),
                    "has_next_batch": has_next_batch
                }
            }
        }
        
    @staticmethod
    def generate_matches_from_twenty_inputs(
        twenty_question_input,
        candidates: list[CandidateProfile],
        pool_context: CandidatePoolContext | None = None
    ) -> dict:
        from nis.adapters.twenty_input_profile_builder import TwentyInputProfileBuilder
        
        # 1. Use the Phase 4 builder to construct internal models securely
        user_profile, match_preference = TwentyInputProfileBuilder.build_profiles(twenty_question_input)
        
        # 2. Pass internal models to the existing matchmaking flow (Phase 1-3 behavior preserved exactly)
        return NISMatchmakingService.generate_considered_few(
            current_user=user_profile,
            match_preference=match_preference,
            candidates=candidates,
            pool_context=pool_context
        )

    @staticmethod
    def _no_match_response(reason_category: str = "NO_ELIGIBLE_CANDIDATES", custom_message: str = None, max_candidates: int = 3) -> dict:
        msg = custom_message if custom_message else "No suitable matches right now. NIS prefers no match over a wrong match."
        status = reason_category if reason_category == "ACTIVE_CONVERSATION_LIMIT_REACHED" else "NO_SUITABLE_MATCHES_RIGHT_NOW"
        return {
            "status": status,
            "candidates": [],
            "message": msg,
            "meta": {
                "source": "NIS",
                "privacy_safe": True
            }
        }
