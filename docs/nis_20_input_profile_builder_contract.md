# NIS 20-Input Profile Builder Contract

## 1. Boundary of Trust
*   **20-input answers are external input:** The raw frontend answers are untrusted preference data. They dictate the user's personality and matching requirements.
*   **Derived signals are internal:** The `TwentyInputSignalEngine` translates external answers into the complex 85+ signal dictionary internally.
*   **Backend/KYC fields are trusted system data:** Variables like `is_verified` and `safety_status` exist entirely outside the 20-question realm and are injected directly by the backend controller.

## 2. Legacy Preservation
*   **UserProfile and MatchPreference are still internal NIS structures:** The core matching engines (`preference_engine`, `psychology_engine`, etc.) still rely heavily on the monolithic `UserProfile` and `MatchPreference` dataclasses. The `TwentyInputProfileBuilder` seamlessly hydrates these legacy objects from the new 20-question inputs so the matching engines do not have to be rewritten.

## 3. Frontend Spoofing Prevention
*   **Frontend cannot spoof verification or safety fields:** Even if a malicious client injects `{"is_verified": true}` into the JSON payload of the 20 answers, the `TwentyInputProfileBuilder` explicitly overrides it using the `SystemKycData` block passed securely from the backend. 

## 4. Phase Context
*   **This phase does not yet change the matchmaking service:** The `nis_matchmaking_service.py` is currently untouched. Phase 4 simply prepared the adapter so that Phase 5 can easily orchestrate the new flow.
