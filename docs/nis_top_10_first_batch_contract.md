# NIS Top 10 First Batch Contract

## 1. Batch Size Limit
NIS strictly limits the maximum returned candidates in a single response to 10. If 15 candidates are evaluated as safe and highly compatible, only the top 10 are returned. If the pool yields fewer than 10 candidates (e.g. 7), only those 7 are returned.

## 2. Internal Ranking
The response list is fully sorted by the internal psychological and preference compatibility scores. However, the exact mathematical scores (`_private_score`, `internal_score`, `match_percentage`) are purged. 
The rank order is implicit in the array sorting, but the explicit `rank` number is also purged.

## 3. Empty Responses
If zero safe candidates are available in the pool, NIS correctly returns the `NO_SUITABLE_MATCHES_RIGHT_NOW` fallback status with an empty candidate array.

## 4. Privacy Guarantee
The frontend only receives the `candidates` array and safe `meta` tags. It NEVER receives any reasoning for the rank, and cannot tell if a candidate passed with a 99% score or a 60% score.

## 5. Phase Context
This phase successfully locked the batching and privacy rules for the first page. However, **this phase does not implement next 10 pagination yet**. The `has_next_batch` metadata flag is tracked but paginated continuation requires Phase 7 orchestration.
