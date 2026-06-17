# NIS Public Response Privacy Contract

## 1. Absolute Asymmetry
NIS fundamentally operates on absolute asymmetry. The algorithms running in the `engines/` directory calculate precise compatibility percentages, exact ranking positions, and deep psychological threat vectors (such as `gaslighting_risk`, `manipulation_risk`, and `control_tendency`). The backend possesses total insight into exactly *why* a candidate was passed or blocked.

However, the frontend receives absolute zero insight into this logic.

## 2. Protected Internal State
The following keys and values are mathematically proven via continuous integration (`test_20_input_batch_privacy_contract.py`) to **never** leak into the public response payload:
- `_private_score`
- `internal_score`
- `match_percentage`
- `rank` / `candidate_rank`
- `score_breakdown`
- `reason_category`
- `dealbreaker_reason` / `psychology_block_reason`
- `dangerous_pairing_reason`
- Any raw signal array derived from the 20 inputs.

## 3. Allowed Public State
The frontend response strictly returns safe UI primitives:
- `status`: Only public-safe statuses like `HAS_CONSIDERED_CANDIDATES`, `NO_SUITABLE_MATCHES_RIGHT_NOW`, or `NO_MORE_CANDIDATES_IN_THIS_BATCH`.
- `candidates`: An array containing safe candidate summaries (like `location`, `tradition`, `communication_note`).
- `meta.privacy_safe`: Always `true`.

## 4. Reason Obfuscation
Whether a pool was empty because everyone failed safety checks, or because the user requested an out-of-bounds pagination offset, the error response remains dignified. NIS does not tell users "You have no matches because everyone was blocked." It safely states: "No suitable matches right now."
