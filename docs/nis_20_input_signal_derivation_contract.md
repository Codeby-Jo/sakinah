# NIS 20-Input Signal Derivation Contract

## Architecture Purpose
This document solidifies the boundary between frontend input and internal matchmaking intelligence. 

1. **NIS receives 20 crisp answers.** The frontend or API layer only ever sends a simplified, 20-question JSON payload via the `TwentyQuestionInput` model.
2. **NIS derives deeper internal matchmaking signals.** Internally, the `TwentyInputSignalEngine` deterministically unwraps these 20 answers into the full 85+ signal dictionary required by the deep psychological and safety engines.
3. **Derived signals are internal only.** Signals like `manipulation_risk`, `control_tendency`, or `gaslighting_risk` are generated purely in system memory. They are never saved to the public database schema.
4. **Frontend must not send or view derived 85 fields.** The API must actively strip any attempts by a client to manually submit internal signals.
5. **Backend/KYC fields remain separate.** Values like `safety_status`, `is_verified`, and `verified_gender` bypass the 20-input user answers entirely.
6. **This phase does not yet connect the derived signals into matchmaking service.** The derivation engine currently sits standalone. It will be wired into `nis_matchmaking_service.py` during Phase 4.
