# NIS Ranked Batch Pagination Contract

## 1. Pagination Over Infinite Swiping
NIS now officially supports considered-set pagination. This is fundamentally different from infinite scrolling or endless "swiping." Candidates are delivered in fixed, deliberate batches (max 10) to encourage intentional consideration. 

## 2. Offset Mathematics
When the frontend or backend requests `batch_number=2` with a `batch_size=10`, NIS evaluates the *entire* pool, ranks them internally, and then applies an array slice `[10:20]`. This ensures the user is strictly viewing the 11th through 20th most mathematically compatible candidates in their area, without knowing their actual rank number.

## 3. Duplicate Prevention Guarantee
The `CandidatePoolContext` provides NIS with arrays of `shown_candidate_ids`, `passed_candidate_ids`, `blocked_candidate_ids`, and `active_conversation_candidate_ids`. NIS aggressively removes these IDs from the considered pool *before* ranking, mathematically guaranteeing that users will never see the same candidate twice in a new batch.

## 4. End of Pool Behavior
If the candidate pool is exhausted and a batch is requested that falls outside the available candidate length (e.g., requesting Batch 3 when only 15 safe candidates exist total), NIS safely traps the request and returns a deterministic `NO_MORE_CANDIDATES_IN_THIS_BATCH` status.

## 5. Security & Privacy
The backend must orchestrate the batch context. The frontend is entirely oblivious to the fact that the backend array was offset. It receives no `rank` or `score` variables that would betray where in the pipeline these candidates sit.
