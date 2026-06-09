# NIS Engine Integration Guide

This document breaks down exactly how the **Neuro-Inclusive Scoring (NIS) Engine** was pulled from the `dev` branch and seamlessly integrated into our backend infrastructure. Use this guide to explain the matchmaking data flow to your lead.

---

## 1. Architectural Strategy (The "Micro-Engine" Approach)
The NIS system built by Ghaniim is massive (containing safety filters, psychology engines, and ranking systems). Instead of mixing his complex logic with our simple API routes, we pulled the entire `nis/` directory from the `dev` branch and placed it directly inside our `backend/` folder.

This treats the NIS Engine as a "Black Box Micro-Engine". Our backend prepares the data, hands it to the box, and the box returns the matches. They are perfectly separated.

---

## 2. The Data Flow (End-to-End Logic)
When a user requests `GET /matches/{id}`, the request triggers a very specific sequence of events in `routes/match.py`:

### Step A: The Database Query
We query PostgreSQL for the user who is requesting matches. If they don't exist, we throw a `404 Not Found`.

### Step B: The KYC Gatekeeper (Strict Rule Enforcement)
The NIS engine is **not legally allowed** to process users who have not passed identity verification. 
Before we even wake up the NIS engine, we run a strict SQLAlchemy query to find candidate users:
```python
# Fetch only candidates who have passed the KYC verification
other_users = db.query(User).filter(User.id != id, User.kyc_status == "verified").all()
```
If a user's `kyc_status` is `pending` or `rejected`, they are completely excluded from the matchmaking pool.

### Step C: The Adapter Pattern
Ghaniim's NIS engine does not understand our SQLAlchemy database models (`models.User`, `models.Preferences`). It has its own strict internal classes like `UserProfile` and `CandidateProfile`.

To solve this without rewriting his engine, we use the **Adapter Pattern** via his `db_to_nis_mapper.py`.
1. We convert our database row (`current_user`) into a standard Python Dictionary.
2. We pass that dictionary into the mapper: `map_db_user_to_user_profile(user_dict)`.
3. The mapper successfully translates our data into the exact format the NIS Engine requires.

---

## 3. Engine Execution (`nis_matchmaking_service.py`)
Now that the data is perfectly formatted, we trigger the engine:

```python
result = NISMatchmakingService.generate_considered_few(
    current_user=nis_user,
    match_preference=nis_pref,
    candidates=nis_candidates
)
```

Behind the scenes, the NIS Engine takes over and runs the candidates through five distinct layers:
1. **Safety Engine:** Checks for blocked users or inappropriate behavior.
2. **Hard Filter Engine:** Automatically rejects candidates who violate strict dealbreakers (e.g., wrong city, outside age range).
3. **Preference Engine:** Scores candidates based on how well they match desired education, religious levels, etc.
4. **Psychology Engine:** Calculates emotional and behavioral compatibility.
5. **Confidence Engine:** Makes the final decision on whether a candidate should be "SHOWN" or "REJECTED".

---

## 4. The Response
If the candidate survives all 5 engines, they are added to the list. The backend then immediately returns this list to the Frontend.

*Privacy Note:* The NIS Engine is designed to be privacy-safe. The returned `result` object strips out highly sensitive data and only returns a `safe_summary` (e.g., location, tradition, and a communication note) alongside the internal matching status.
