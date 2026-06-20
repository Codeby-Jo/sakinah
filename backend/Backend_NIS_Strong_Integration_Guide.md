# Backend-NIS Strong Integration Guide
## Sakinah / ZaryahPlus Matchmaking

## 1. Purpose

This document explains exactly what the backend must do to integrate strongly with the NIS engine.

NIS is the matchmaking intelligence engine. Backend is the controller that connects NIS with the real application.

Backend sits between:

```text
Frontend
Database
Authentication
Email/Phone Verification
KYC System
NIS Engine
Candidate State Storage
Mutual Interest Flow
Conversation Flow
Admin/Safety Review
```

NIS should not directly own the database, frontend, KYC provider, OTP provider, or chat system.

NIS should only do this:

```text
Receive clean input
Evaluate candidate suitability
Apply safety and compatibility rules
Privately score and rank candidates
Return privacy-safe candidate batches
```

Backend should do this:

```text
Authenticate users
Store data
Verify KYC status
Fetch candidate pools
Build NIS input
Call NIS
Store NIS output
Handle user actions
Return safe response to frontend
```

---

## 2. Final Backend-NIS Architecture

The correct architecture is:

```text
User completes frontend 20-question form
↓
Backend receives and validates answers
↓
Backend checks authentication
↓
Backend checks email/phone verification if required
↓
Backend checks KYC verification
↓
Backend stores 20 answers
↓
Backend fetches possible candidates from database
↓
Backend builds CandidatePoolContext
↓
Backend calls NIS
↓
NIS derives internal signals
↓
NIS filters, scores, ranks, and batches candidates
↓
NIS returns privacy-safe result
↓
Backend stores shown candidates / considered set
↓
Backend returns safe response to frontend
```

Simple rule:

```text
Database handles scale.
Backend handles coordination.
NIS handles intelligence.
Frontend stays simple.
```

---

## 3. What NIS Now Supports

The completed NIS engine now supports:

```text
20 crisp input answers
internal signal derivation
internal UserProfile and MatchPreference builder
KYC gate
gender eligibility
same-gender rejection
safety filtering
banned/unverified rejection
hard filter logic
dealbreaker blocking
matrimonial preference handling
preferred marital status filtering
preferred height/basic physical preference handling
psychology/vulnerability protection
private internal scoring
top 10 first candidate batch
next 10 ranked candidate batch
safe no-match response
safe no-more-candidates response
public privacy contract
5000 candidate performance test
50 concurrent request stateless test
```

Final test status from NIS side:

```text
89 / 89 tests passed
```

---

## 4. What Backend Must Send to NIS

Backend must send three major objects to NIS:

```text
1. TwentyQuestionInput
2. CandidateProfile list
3. CandidatePoolContext
```

Backend may also pass trusted system/KYC data through the NIS-supported model structure.

---

## 5. TwentyQuestionInput

The frontend should ask only 20 crisp questions.

Backend should receive those 20 answers, validate them, store them, and pass them to NIS.

### 5.1 Final 20 Inputs

The final 20 inputs should cover:

```text
1. age_or_birth_year
2. gender
3. location
4. seeker_marital_status
5. education_occupation
6. religious_practice_and_islamic_home
7. marriage_readiness
8. pref_age_range
9. pref_location_flexibility
10. pref_marital_status
11. pref_height_or_physical_preference
12. pref_religious_alignment
13. pref_education_work
14. family_wali_involvement
15. marriage_timeline
16. strict_dealbreakers
17. communication_style
18. conflict_repair
19. boundary_emotional_safety
20. lifestyle_finances
```

### 5.2 Example TwentyQuestionInput Payload

```json
{
  "age_or_birth_year": 24,
  "gender": "MALE",
  "location": "Chennai",
  "seeker_marital_status": "NEVER_MARRIED",
  "education_occupation": "GRADUATE_WORKING",
  "religious_practice_and_islamic_home": "PRACTICING_MODERATE_HOME",
  "marriage_readiness": "READY_WITHIN_6_MONTHS",
  "pref_age_range": "21_26",
  "pref_location_flexibility": "SAME_STATE_PREFERRED",
  "pref_marital_status": "ONLY_NEVER_MARRIED",
  "pref_height_or_physical_preference": {
    "mode": "HEIGHT_RANGE_REQUIRED",
    "min": 150,
    "max": 170,
    "strict": true
  },
  "pref_religious_alignment": "PRACTICING",
  "pref_education_work": "GRADUATE_OR_WORKING",
  "family_wali_involvement": "FAMILY_INVOLVED_EARLY",
  "marriage_timeline": "WITHIN_1_YEAR",
  "strict_dealbreakers": ["SMOKING", "NO_PRAYER"],
  "communication_style": "CALM_DIRECT",
  "conflict_repair": "HEALTHY_REPAIR",
  "boundary_emotional_safety": "RESPECTFUL_BOUNDARIES",
  "lifestyle_finances": "RESPONSIBLE_SIMPLE_LIFESTYLE"
}
```

### 5.3 Important Rule

Frontend should not send internal NIS fields.

Frontend must not send:

```text
_private_score
internal_score
match_percentage
rank
psychology labels
derived signals
is_verified
safety_status
is_banned
verified_gender
verified_age
```

The frontend sends only the 20 answers.

---

## 6. Trusted System/KYC Data

Backend must provide trusted system fields.

These fields must come from backend/database/KYC, not from frontend.

Example:

```json
{
  "user_id": "user_123",
  "is_verified": true,
  "verified_gender": "MALE",
  "verified_age": 24,
  "is_banned": false,
  "safety_status": "CLEAR"
}
```

### 6.1 Backend Must Own These Fields

```text
user_id
email_verified
phone_verified
kyc_status
is_verified
verified_gender
verified_age
is_banned
safety_status
known_dealbreaker_traits
manual_review_status
```

### 6.2 Frontend Must Not Control These Fields

Frontend cannot decide:

```text
I am KYC verified
I am safe
I am not banned
My verified gender is male/female
My verified age is X
```

These must be backend/KYC-controlled only.

---

## 7. KYC Rules for Backend

Backend must enforce KYC before calling NIS.

Backend should block matchmaking if:

```text
user is not logged in
email/phone verification is required but missing
KYC is not verified
verified_gender is missing
verified_age is missing
profile gender and verified gender mismatch
user is underage
user is banned
safety_status is not CLEAR
```

NIS also has KYC/safety gates, but backend should block early to reduce unnecessary NIS calls.

### 7.1 Gender Impersonation Rule

If someone creates a female profile while KYC says male, backend must block matchmaking.

Rule:

```text
Matchmaking gender must come from verified KYC.
Self-declared frontend gender must not override verified gender.
```

---

## 8. CandidateProfile List

Backend must fetch candidate profiles from database and send them to NIS as CandidateProfile objects or compatible mapped data.

NIS does not search the database by itself.

### 8.1 Backend Candidate Prefiltering

Backend should prefilter candidates before sending to NIS.

Backend should filter by:

```text
candidate is verified
candidate is not banned
candidate safety_status is CLEAR
candidate is opposite gender
candidate is not already passed
candidate is not blocked
candidate is not in active conversation
candidate is not already shown in the same considered set
candidate roughly fits age range if strict
candidate roughly fits location if strict
candidate roughly fits marital status if strict
```

NIS can handle 5000 mock candidates in testing, but production should not blindly send all users if database filtering is available.

Recommended candidate pool size sent to NIS:

```text
100 to 500 candidates normally
```

NIS can handle more, but backend/database should still be smart.

---

## 9. Gender Eligibility Rules

Backend should prefilter opposite gender.

Rules:

```text
If seeker is MALE, candidate must be FEMALE.
If seeker is FEMALE, candidate must be MALE.
If seeker gender is missing, block matchmaking.
If candidate gender is missing, do not send candidate to NIS.
Same-gender candidates should not be sent if backend can avoid it.
```

If same-gender candidates are accidentally sent, NIS will still reject them silently.

Public response must not say:

```text
rejected because same gender
gender filter failed
same gender candidate blocked
```

Public response should simply be safe and dignified.

---

## 10. CandidatePoolContext

Backend must send CandidatePoolContext to NIS.

This tells NIS which batch is being requested and which candidates must be excluded.

### 10.1 CandidatePoolContext Fields

```json
{
  "seeker_id": "user_123",
  "batch_number": 1,
  "batch_size": 10,
  "max_batch_size": 10,
  "shown_candidate_ids": [],
  "passed_candidate_ids": [],
  "blocked_candidate_ids": [],
  "active_conversation_candidate_ids": [],
  "active_conversations_count": 0,
  "max_active_conversations": 2
}
```

### 10.2 For Next Batch

```json
{
  "seeker_id": "user_123",
  "batch_number": 2,
  "batch_size": 10,
  "max_batch_size": 10,
  "shown_candidate_ids": ["cand_001", "cand_002"],
  "passed_candidate_ids": ["cand_003"],
  "blocked_candidate_ids": [],
  "active_conversation_candidate_ids": [],
  "active_conversations_count": 0,
  "max_active_conversations": 2
}
```

### 10.3 CandidatePoolContext Rules

Backend must include:

```text
shown candidates
passed candidates
blocked candidates
active conversation candidates
batch number
batch size
active conversation count
```

NIS uses this to prevent repeats and enforce active conversation caps.

---

## 11. Batch Logic

NIS supports ranked candidate batches.

```text
Batch 1 = top 10 ranked safe candidates
Batch 2 = candidates 11 to 20
```

### 11.1 First Batch Flow

```text
User requests matches
↓
Backend sends batch_number = 1
↓
NIS returns top 10 candidates
↓
Backend stores returned candidates as SHOWN
↓
Frontend displays candidates
```

### 11.2 Next Batch Flow

```text
User passes/exhausts first batch
↓
Frontend clicks "Show next set of candidates"
↓
Backend sends batch_number = 2
↓
Backend includes shown/passed/blocked/active candidate IDs
↓
NIS returns candidates 11–20
↓
Backend stores returned candidates as SHOWN
↓
Frontend displays candidates
```

### 11.3 Important Product Rule

This must not become swipe browsing.

Allowed wording:

```text
Show next set of candidates
View next considered set
```

Avoid:

```text
Swipe more
Browse more profiles
Load endless profiles
```

---

## 12. Backend Must Store Matchmaking States

Backend must store candidate interaction states.

Suggested table/collection:

```text
considered_sets
```

Fields:

```text
considered_set_id
seeker_id
batch_number
candidate_ids
status
created_at
expires_at
source = NIS
```

Suggested statuses:

```text
ACTIVE
EXPIRED
COMPLETED
REPLACED
```

Suggested table/collection:

```text
candidate_interactions
```

Fields:

```text
seeker_id
candidate_id
status
shown_at
passed_at
interest_at
blocked_at
considered_set_id
batch_number
```

Suggested statuses:

```text
SHOWN
PASSED
INTERESTED
MUTUAL_INTEREST
BLOCKED
EXPIRED
```

---

## 13. Backend Must Prevent Duplicate Generation

If the user clicks generate matches multiple times, backend must not create conflicting NIS outputs.

Backend should first check:

```text
Does seeker already have an active considered set?
```

If yes:

```text
Return existing active set.
```

If no:

```text
Call NIS and create a new considered set.
```

Backend should use one of these:

```text
database transaction
row lock
distributed lock
idempotency key
unique active considered set per seeker
```

This prevents:

```text
duplicate candidate batches
race conditions
extra load
confusing frontend state
```

---

## 14. Backend API Endpoints Needed

### 14.1 Generate First Batch

```text
POST /sakinah/matches/generate
```

Purpose:

```text
Generate top 10 candidate batch from NIS.
```

Backend steps:

```text
1. Verify logged-in user.
2. Check email/phone verification if required.
3. Check KYC verified.
4. Fetch stored 20 answers.
5. Fetch candidate pool.
6. Build CandidatePoolContext with batch_number = 1.
7. Call NIS.
8. Store returned candidates.
9. Return safe response to frontend.
```

### 14.2 Generate Next Batch

```text
POST /sakinah/matches/next-batch
```

Purpose:

```text
Generate next 10 ranked candidates.
```

Backend steps:

```text
1. Verify logged-in user.
2. Check KYC verified.
3. Fetch 20 answers.
4. Fetch shown/passed/blocked/active candidate IDs.
5. Fetch candidate pool.
6. Build CandidatePoolContext with batch_number = 2.
7. Call NIS.
8. Store returned candidates.
9. Return safe response.
```

### 14.3 Pass Candidate

```text
POST /sakinah/candidates/{candidate_id}/pass
```

Purpose:

```text
User silently passes candidate.
```

Rules:

```text
Store PASSED.
Do not notify candidate.
Do not expose rejection.
```

### 14.4 Show Interest

```text
POST /sakinah/candidates/{candidate_id}/interest
```

Purpose:

```text
User privately shows interest.
```

Rules:

```text
Store INTERESTED.
Interest is private.
Do not notify unless mutual interest happens.
```

### 14.5 Evaluate Mutual Interest

```text
POST /sakinah/mutual-interest/evaluate
```

Purpose:

```text
Check if both users showed interest.
```

If mutual:

```text
Create structured conversation.
```

If not mutual:

```text
Do nothing publicly.
No rejection notification.
```

---

## 15. Backend-NIS Pseudo-Code

```python
from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.models.twenty_question_input import TwentyQuestionInput, SystemKycData
from nis.models.candidate_pool_context import CandidatePoolContext

def generate_matches_for_user(user_id):
    user = db.get_user(user_id)

    if not user:
        raise UnauthorizedError()

    if user.is_banned:
        return safe_blocked_response()

    if user.kyc_status != "VERIFIED":
        return kyc_required_response()

    answers = db.get_twenty_question_answers(user_id)

    system_data = SystemKycData(
        user_id=user.id,
        is_verified=user.kyc_status == "VERIFIED",
        verified_gender=user.verified_gender,
        verified_age=user.verified_age,
        is_banned=user.is_banned,
        safety_status=user.safety_status
    )

    twenty_input = TwentyQuestionInput(
        **answers,
        system_kyc_data=system_data
    )

    candidate_pool = db.fetch_candidate_pool_for_user(
        seeker_id=user_id,
        verified=True,
        banned=False,
        safety_status="CLEAR",
        opposite_gender_of=user.verified_gender
    )

    context = CandidatePoolContext(
        seeker_id=user_id,
        batch_number=1,
        batch_size=10,
        max_batch_size=10,
        shown_candidate_ids=db.get_shown_candidate_ids(user_id),
        passed_candidate_ids=db.get_passed_candidate_ids(user_id),
        blocked_candidate_ids=db.get_blocked_candidate_ids(user_id),
        active_conversation_candidate_ids=db.get_active_conversation_candidate_ids(user_id),
        active_conversations_count=db.get_active_conversation_count(user_id),
        max_active_conversations=2
    )

    result = NISMatchmakingService.generate_matches_from_twenty_inputs(
        twenty_question_input=twenty_input,
        candidate_pool=candidate_pool,
        pool_context=context
    )

    db.store_considered_set(user_id, result)

    return sanitize_for_frontend(result)
```

---

## 16. What Backend Must Never Expose

Backend must never send these to frontend:

```text
_private_score
internal_score
match_percentage
rank
candidate_rank
score_breakdown
reason_category
dealbreaker_reason
psychology_block_reason
dangerous_pairing_reason
same_gender_reason
gender_filter_reason
raw derived signals
private psychology labels
gaslighting_risk
manipulation_risk
control_tendency
religious_control_risk
financial_control_tendency
beauty_score
photo_rating
```

NIS already removes them, but backend should still sanitize response before sending to frontend.

---

## 17. Safe Frontend Response Example

Backend can return:

```json
{
  "status": "HAS_CONSIDERED_CANDIDATES",
  "batch": {
    "batch_number": 1,
    "batch_size": 10,
    "has_next_batch": true
  },
  "candidates": [
    {
      "candidate_id": "cand_001",
      "safe_summary": {
        "age": 23,
        "location": "Chennai",
        "education": "Graduate",
        "religious_practice": "Practicing",
        "marital_status": "Never married"
      }
    }
  ],
  "meta": {
    "source": "NIS",
    "privacy_safe": true
  }
}
```

Frontend should never receive:

```text
score
rank
percentage
private rejection reason
psychology label
```

---

## 18. No-Match Responses

### 18.1 No Suitable Matches

If NIS returns no suitable candidates:

```json
{
  "status": "NO_SUITABLE_MATCHES_RIGHT_NOW",
  "candidates": [],
  "message": "No suitable matches right now. NIS prefers no match over a wrong match.",
  "meta": {
    "source": "NIS",
    "privacy_safe": true
  }
}
```

### 18.2 No More Candidates in Batch

If the requested next batch has no candidates:

```json
{
  "status": "NO_MORE_CANDIDATES_IN_THIS_BATCH",
  "candidates": [],
  "message": "No more suitable candidates are available right now.",
  "meta": {
    "source": "NIS",
    "privacy_safe": true
  }
}
```

Backend should pass these safely to frontend.

Backend should not add private reason details.

---

## 19. Mutual Interest Flow

Backend owns mutual interest flow.

NIS can support mutual interest logic, but backend must store and control the state.

Flow:

```text
Candidate shown
↓
User passes or shows interest
↓
Pass is silent
↓
Interest is private
↓
If both users show interest
↓
Backend creates structured conversation
↓
If not mutual
↓
No public rejection notification
```

Rules:

```text
No rejection notification
No public interest unless mutual
No contact details leakage
No chat before mutual gate
```

---

## 20. Backend Testing Requirements

Backend team should write integration tests for:

```text
1. Unverified user cannot call NIS.
2. Verified user can call NIS.
3. Backend sends only 20 answers to NIS.
4. Backend sends KYC/system data separately.
5. Same-gender candidates are prefiltered.
6. Banned candidates are prefiltered.
7. Unsafe candidates are prefiltered.
8. CandidatePoolContext is created correctly.
9. Batch 1 returns top 10.
10. Batch 2 returns next 10.
11. Passed candidates are not repeated.
12. Blocked candidates are not repeated.
13. Active conversation candidates are not repeated.
14. Public response contains no score/rank/percentage.
15. Duplicate match generation is prevented.
16. Existing active considered set is reused.
17. Pass is silent.
18. Interest is private.
19. Mutual interest creates conversation.
20. Non-mutual interest sends no rejection notification.
21. KYC gender mismatch blocks matchmaking.
22. Underage user is blocked.
23. Banned user is blocked.
24. Backend sanitizes response even if NIS output changes.
```

---

## 21. Backend Final Checklist

Backend integration is complete only when:

```text
Authentication is working
Email/phone verification status is stored
KYC status is stored
Verified age and gender are stored
20-question answers are stored
Candidate pool fetching is working
CandidatePoolContext is created correctly
NIS call works
Top 10 batch is stored
Next 10 batch is stored
Shown/passed/blocked/active states are stored
Same-gender candidates are blocked
Banned/unsafe/unverified candidates are blocked
Private score/rank/percentage is not exposed
Private rejection reason is not exposed
Duplicate generation is prevented
Pass is silent
Interest is private
Mutual interest creates conversation only when both sides are interested
Frontend receives only safe response
Backend tests pass
```

---

## 22. What NIS Requires from Backend

NIS requires backend to provide:

```text
clean 20-question answers
trusted KYC/system data
valid candidate pool
CandidatePoolContext
shown/passed/blocked/active candidate IDs
batch number
batch size
active conversation count
```

NIS also expects backend to:

```text
not send raw untrusted frontend system fields
not expose NIS internals
not use NIS as a database search engine
not create duplicate active batches
not make candidate browsing endless
```

---

## 23. What Backend Requires from NIS

Backend requires NIS to return:

```text
status
candidates
batch metadata
message if needed
meta.source = NIS
meta.privacy_safe = true
```

Backend also requires NIS to:

```text
block unsafe candidates
block same-gender candidates
block banned/unverified candidates
block dealbreakers
apply psychology protection
rank candidates privately
return top 10
return next 10
hide private score/rank/percentage
hide rejection reasons
stay stateless
handle large candidate pools safely
```

---

## 24. Final Summary

NIS is now ready as a matchmaking intelligence engine.

Backend must make it production-useful by handling:

```text
authentication
database
KYC status
candidate fetching
candidate state tracking
batch storage
pass/interest actions
mutual interest
safe frontend response
duplicate prevention
```

NIS decides suitability internally.

Backend controls the real app flow.

Frontend stays simple and user-friendly.

Final integration principle:

```text
Backend prepares the world.
NIS judges compatibility.
Backend stores the result.
Frontend shows only safe dignity-first output.
```
