# NIS — NEXUS Intelligence System

NIS is the server-side compatibility intelligence engine for Sakinah/ZaryahPlus matchmaking.

## What NIS Does

NIS is a stateless, pure-data pipeline that:
- accepts 20 crisp user input answers
- derives deeper internal matchmaking signals
- checks KYC/safety/gender eligibility
- filters unsafe or unsuitable candidates
- considers seeker spouse/candidate preferences
- privately scores and ranks candidates
- returns top 10 safe ranked candidates
- supports next 10 ranked candidate batch
- protects all private internal reasoning

## Current 20-Input Architecture

The exact flow of the engine is as follows:

```text
TwentyQuestionInput
↓
TwentyInputSignalEngine
↓
TwentyInputProfileBuilder
↓
Internal UserProfile + MatchPreference
↓
NISMatchmakingService
↓
Safety / Hard Filter / Preference / Psychology / Ranking Engines
↓
Top 10 safe candidates
↓
Next 10 safe candidates when requested
↓
Privacy-safe response
```

## Main Features Completed

The following features have been fully built and tested:
- 20-input model
- internal signal derivation
- profile builder
- 20-input matchmaking service method
- KYC gate
- gender eligibility
- same-gender rejection
- safety filtering
- banned/unverified rejection
- hard filter logic
- dealbreaker blocking
- seeker candidate/spouse preference handling
- preferred marital status filtering
- preferred height/basic physical preference handling
- psychology/vulnerability protection
- private scoring
- top 10 first batch
- next 10 batch pagination
- safe no-match response
- safe no-more-candidates response
- public privacy contract
- 5000 candidate performance test
- 50 concurrent request stateless test

## Matrimonial Preference Handling

NIS considers what the seeker explicitly wants in a candidate/spouse without turning matchmaking into a superficial contest.
NIS supports:
- preferred age range
- preferred location flexibility
- preferred marital status
- preferred height / basic physical preference
- preferred religious alignment
- preferred Islamic home environment
- preferred education/work outlook
- family/wali involvement preference
- strict dealbreakers
- soft preferences for ranking

**Important Rules:**
- Strict preferences can become hard filters.
- Flexible preferences influence private internal ranking.
- Physical preference is handled carefully and must not become beauty scoring, photo rating, or swipe behavior.

## Privacy Rules

NIS operates under a strict privacy contract. Public responses never expose:
- _private_score
- internal_score
- match_percentage
- rank
- candidate_rank
- score_breakdown
- reason_category
- dealbreaker_reason
- psychology_block_reason
- dangerous_pairing_reason
- same_gender_reason
- gender_filter_reason
- raw derived signals
- private psychology labels
- beauty_score
- photo_rating

## Candidate Batching

NIS supports pagination without creating endless scrolling behaviors:
- Batch 1 returns top 10 ranked safe candidates.
- Batch 2 returns candidates 11–20.
- Batch size is capped at 10.
- NIS does not create swipe or endless browsing behavior.
- Already shown, passed, blocked, active conversation, unsafe, same-gender, banned, unverified, and dealbreaker candidates are safely excluded from subsequent batches.

## Performance and Concurrency

- NIS has been tested with 5000 mock candidates.
- NIS has been tested with 50 concurrent-style requests.
- NIS remains completely stateless.
- NIS does not store request state globally.
- Backend/database handles all persistence.

## What NIS Does Not Do

- NIS does not own frontend.
- NIS does not own real database storage.
- NIS does not verify raw KYC documents.
- NIS does not send OTP.
- NIS does not create chat conversations.
- NIS does not show public scores or percentages.
- NIS does not decide marriage outcomes.
- NIS does not replace human/family/wali decision-making.

## Backend Integration Expectation

The backend server implementing NIS is responsible for providing all external state:
- Backend must provide verified KYC/system fields.
- Backend must fetch the candidate pool.
- Backend must pass CandidatePoolContext.
- Backend must store shown/passed/blocked/active conversation states.
- Backend must prevent duplicate simultaneous generation for the same seeker.
- NIS only processes the candidate pool and returns privacy-safe matching output.

## Test Status

Final test status:
89/89 tests passed.
