# NIS 20-Input Service Integration Contract

## 1. Architectural Integration
NIS can now fully accept the 20-input model directly at the service layer via the `NISMatchmakingService.generate_matches_from_twenty_inputs` method.
Behind the scenes, NIS internally builds the legacy `UserProfile` and `MatchPreference` datasets to feed into the matchmaking matrix.

## 2. Unbroken Intelligence
Existing engines (`safety_engine`, `hard_filter_engine`, `preference_engine`, `psychology_engine`, `confidence_engine`) remain the absolute source of matching intelligence. Their logic was not diluted, bypassed, or rewritten. A dangerous psychological profile (e.g. high manipulation risk vs low boundaries) correctly triggers a `BLOCKED` status through the 20-input flow exactly as it did through the legacy flow.

## 3. Legacy Compatibility
The old direct object flow (`generate_considered_few`) remains fully available and unmodified for backward compatibility, preventing catastrophic breakage for any systems still transitioning.

## 4. Privacy Guarantee
The frontend strictly receives the `SHOWN` status wrapper (containing candidate ID and safe summary). Crucially:
*   Frontend still does not send the 85 fields.
*   Backend/KYC fields remain fully trusted system fields that the frontend cannot override.
*   The API response aggressively purges `_private_score`, `internal_score`, `match_percentage`, `rank`, and all private psychological flags.

## 5. Phase Context
This phase achieved end-to-end matchmaking from 20 questions. However, **this phase does not yet implement top 10 batch pagination**, which will be tackled in Phase 6.
