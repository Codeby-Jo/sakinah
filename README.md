# NEXUS Intelligence System (NIS)

## 1. What NIS is
- NIS stands for NEXUS Intelligence System.
- It is the standalone matchmaking intelligence engine for the Sakinah platform.
- It decides which candidates are safe and suitable enough to be shown to the user.
- It strictly follows the core philosophy: **No match is better than the wrong match.**

## 2. Gender-Neutral Seeker Support
- The seeker (current user) can be **MALE** or **FEMALE**.
- NIS does not assume only male seekers, nor does it assume only female candidates.
- If the seeker is **MALE**, the candidate must be **FEMALE**.
- If the seeker is **FEMALE**, the candidate must be **MALE**.
- **Same-gender candidate suggestions are strictly blocked.**
- Missing seeker gender returns a strict no-match.
- Missing candidate gender strictly blocks the candidate.
- Gender eligibility is a hard system rule executed before all preferences and psychology.

## 3. MatchPreference Terminology
- NIS uses **MatchPreference**.
- `MatchPreference` means gender-neutral preferred candidate criteria.
- It is **not** a "wife preference", "bride preference", "groom preference", or male-only preference.
- The exact same `MatchPreference` structure works flawlessly for both male and female seekers.
- Gender eligibility is entirely separate from MatchPreference and cannot be overridden by any preference settings.

## 4. What Input NIS Takes
NIS takes three primary inputs for evaluation:
1. `current_user` (`UserProfile`)
2. `match_preference` (`MatchPreference`)
3. `candidates` (List of `CandidateProfile`)

## 5. What NIS Strongly Considers
NIS carefully evaluates candidates against the following factors:
- Gender eligibility
- Age
- Height
- Marital status
- Location
- Relocation openness
- Tradition/maslak
- Religious practice alignment
- Islamic home environment
- Education
- Occupation
- Work outlook
- Financial responsibility
- Family/wali expectations
- Lifestyle
- Communication style
- Conflict style
- Repair style
- Dealbreakers
- Non-negotiables
- Flexible preferences
- Safety/privacy preferences
- Psychological pair dynamics
- Safety status

## 6. What Engines NIS Uses
NIS operates as a pipeline of decoupled engines:
- **Safety Engine**: Checks for bans, blocks, and ongoing safety reviews.
- **Hard Filter Engine**: Enforces gender, age, height, education, occupation, and dealbreakers based on strictness.
- **Preference Engine**: Evaluates soft qualitative matches like tradition, religious practice, family boundaries, and communication.
- **Psychology Engine**: Identifies dangerous relational loops and healthy complementarity.
- **Confidence Engine**: Makes the final mathematical or rules-based decision to SHOW or BLOCK based on results from all other engines.
- **NISMatchmakingService**: The main orchestrator connecting the flow.

## 7. How NIS Decides
The evaluation flow follows this strict sequence:
1. Current user validation
2. ↓
3. Gender eligibility
4. ↓
5. Candidate safety check
6. ↓
7. Hard filters
8. ↓
9. MatchPreference evaluation
10. ↓
11. Psychological pair dynamics
12. ↓
13. Confidence decision
14. ↓
15. Considered few or no-match

## 8. Hard Filter Examples
- **Same-gender candidate** → BLOCKED
- **Missing candidate gender** → BLOCKED
- **Missing seeker gender** → NO-MATCH
- **Strict age mismatch** → BLOCKED
- **Strict height mismatch** → BLOCKED
- **Strict marital status mismatch** → BLOCKED
- **Strict education mismatch** → BLOCKED
- **Strict occupation/work mismatch** → BLOCKED
- **Dealbreaker** → BLOCKED
- **Unsafe/banned candidate** → BLOCKED

## 9. Soft Preference Examples
- **Flexible height mismatch** → SOFT MISMATCH
- **Flexible location mismatch** → SOFT MISMATCH
- **Preferred tradition mismatch** → SOFT MISMATCH
- **Lifestyle mismatch** → SOFT/CONTEXTUAL MISMATCH

## 10. Psychology Examples
- **High anger + High anger** → BLOCKED
- **High anger + Weak repair** → BLOCKED
- **Volatile + Volatile** → BLOCKED
- **Weak boundaries + High family pressure** → FLAGGED/REVIEW REQUIRED
- **Calm + Expressive with repair** → Healthy Complementarity

## 11. What NIS Must Never Do
To protect user privacy and emotional well-being, NIS must never:
- Provide a compatibility percentage.
- Make a "perfect match" claim.
- Give a marriage recommendation.
- Output a spiritual score.
- Output a worship score.
- Expose raw private data, notes, or IDs.
- Use random candidate padding to increase volume.
- Create fake abundance.
- Rely on frontend decision-making.
- Rely on male-only assumptions.
- Make same-gender suggestions.

## 12. How to Run Tests
To run the NIS test suite, execute the following from inside the `nis_engine` directory:

```bash
python -m pytest tests -ra
```

- **Status**: The current test suite has **27 passing tests**.
- **Tech Stack**: Pure Python only.
- No database connections.
- No FastAPI dependencies.
- No Firebase integrations.

## 13. Backend-Safe NIS Response Contract

Joshua should import and call the service as follows:

```python
from nis.services.nis_matchmaking_service import NISMatchmakingService

result = NISMatchmakingService.generate_considered_few(
    current_user=current_user_profile,
    match_preference=match_preference,
    candidates=candidate_pool,
    pool_context=pool_context  # Optional but recommended
)
```

**Success Response:**
```json
{
  "status": "HAS_CONSIDERED_CANDIDATES",
  "candidates": [
    {
      "candidate_id": "candidate_123",
      "status": "SHOWN",
      "safe_summary": {
        "location": "Chennai",
        "tradition": "Sunni-Hanafi",
        "readiness": "READY",
        "communication_note": "Communication style is calm"
      }
    }
  ],
  "meta": {
    "max_candidates": 3,
    "source": "NIS",
    "privacy_safe": true
  }
}
```

**No-Match Response:**
```json
{
  "status": "NO_SUITABLE_MATCHES_RIGHT_NOW",
  "candidates": [],
  "reason_category": "STRICT_PREFERENCES_TOO_NARROW",
  "message": "No suitable matches right now. NIS prefers no match over a wrong match.",
  "meta": {
    "max_candidates": 3,
    "source": "NIS",
    "privacy_safe": true
  }
}
```

**Active Limit Response:**
```json
{
  "status": "ACTIVE_CONVERSATION_LIMIT_REACHED",
  "candidates": [],
  "reason_category": "ACTIVE_CONVERSATION_LIMIT_REACHED",
  "message": "Continue your current conversation before receiving new candidates.",
  "meta": {
    "max_candidates": 3,
    "source": "NIS",
    "privacy_safe": true
  }
}
```

* backend sends seeker, MatchPreference, candidate pool, and optional CandidatePoolContext
* NIS returns safe standardized response
* backend stores response
* frontend displays only safe data
* no frontend/backend should invent match decisions outside NIS
* no scores/percentages/perfect-match wording should be shown

## 15. Mock Data Explanation
For testing, `mock_users.py` acts like a mock database without external dependencies.
- **Strong candidate**: Passes all checks.
- **Same-gender candidate**: Blocks immediately.
- **Missing-gender candidate**: Blocks immediately.
- **Age mismatch**: Blocks (age is usually strict).
- **Height mismatch**: Blocks if marked as strict.
- **Marital status mismatch**: Blocks if marked as strict.
- **Education/occupation/work mismatch**: Blocks if marked as strict.
- **Banned candidate**: Blocks at the safety engine.
- **Unsafe candidate**: Blocks or triggers a review at the safety engine.
- **Angry weak repair**: Blocks due to dangerous relational dynamics.
- **Dealbreaker**: Blocks at the hard filter engine.
- **Insufficient data**: Blocks.

## 16. Current Test Proof
- **27 tests passed** with zero failures.
- NIS uses full Sakinah `MatchPreference` inputs containing all qualitative and quantitative preferences.
- Male and female seeker flows are successfully tested and proven perfectly symmetrical.
- Same-gender candidate suggestions are actively blocked.
- The engine remains standalone, pure Python.
- No database.
- No FastAPI.
- No Firebase.
