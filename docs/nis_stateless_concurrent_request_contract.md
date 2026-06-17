# NIS Stateless Concurrent Request Contract

## 1. Stateless Architecture
NIS operates as a pure data-in/data-out pipeline. It maintains absolutely zero global request state, database connections, or session trackers within the `NISMatchmakingService`. 

All context required for evaluating a match is injected entirely at runtime via `TwentyQuestionInput` (representing the seeker) and `CandidatePoolContext` (representing the pagination offset and exclusion rules). 

## 2. Shared Candidate Immutability
NIS is mathematically proven to be thread-safe regarding candidate mutation. When 50 concurrent matching requests evaluate the same shared array of `CandidateProfile` objects in RAM, they do so immutably.
Temporary attributes such as `_private_score` and `internal_score` are isolated to localized dictionaries created dynamically inside the pipeline and stripped before returning to the frontend. The original `CandidateProfile` objects are never mutated.

## 3. Concurrent Request Isolation
During aggressive concurrent benchmarking (`tests/test_nis_stateless_concurrent_requests.py`), NIS successfully:
- Prevented batch numbers from different users overwriting each other.
- Prevented blocked/shown/passed exclusions from one user filtering the candidate pool for another.
- Generated strictly separate, zero-knowledge, privacy-safe payloads for each active thread.

## 4. Backend Persistence Rules
Because NIS is strictly stateless:
- **NIS DOES NOT:** Persist candidates, store batch numbers to databases, or record matches.
- **THE BACKEND MUST:** Keep track of who the user has passed, blocked, or started conversations with.
- **THE BACKEND MUST:** Inject these historical arrays into `CandidatePoolContext` when pinging NIS for the next batch.
