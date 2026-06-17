# NIS Empty Response Contract

## 1. Zero Knowledge Leaks
NIS adheres strictly to a zero-knowledge response protocol when handling empty matching sets. No matter what combination of hard filters, psychological blocks, or mathematical exclusions caused a candidate pool to drop to zero, the user will NEVER know why. The response `NO_SUITABLE_MATCHES_RIGHT_NOW` completely obscures whether the pool was simply exhausted, if everyone failed safety gates, or if the user's expectations were too narrow.

## 2. No-Match Standardization
If no valid candidates exist for Batch 1, NIS explicitly returns:
```json
{
  "status": "NO_SUITABLE_MATCHES_RIGHT_NOW",
  "candidates": [],
  "message": "No suitable matches right now. NIS prefers no match over a wrong match.",
  "meta": { "source": "NIS", "privacy_safe": true }
}
```
All internal `reason_category` metadata is fully stripped from the public-facing response. 

## 3. No-More-Candidates Standardization
If valid candidates were shown in previous batches, but the current requested batch offset exceeds the safe pool length, NIS explicitly returns:
```json
{
  "status": "NO_MORE_CANDIDATES_IN_THIS_BATCH",
  "candidates": [],
  "message": "No more suitable candidates are available right now.",
  "meta": { "source": "NIS", "privacy_safe": true }
}
```

## 4. Protected Fields
Under NO circumstances will NIS return:
- `reason_category`
- `_private_score`
- `internal_score`
- `match_percentage`
- `score_breakdown`
- `dealbreaker_reason`
- `psychology_block_reason`
- `dangerous_pairing_reason`

Privacy and dignity are considered mathematically absolute.
