# Sakinah Backend API

## Overview

Sakinah is a character-first, halal Islamic marriage journey platform with a server-authoritative backend. The NIS (Niyyah Integration System) matchmaking engine handles all compatibility intelligence internally — the backend coordinates all flows between the frontend, Firestore database, KYC verification, and NIS.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI (Python) |
| Database | **Firestore** (Firebase Admin SDK) — no SQL database |
| Authentication | Local JWT tokens + Firebase ID Token fallback |
| Matchmaking | NIS Engine (internal, server-side only) |
| Deployment | Render (web service) |

> ⚠️ There is **no PostgreSQL, SQLite, or SQLAlchemy** in this project. All data is stored in Firestore.

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `profiles` | Seeker matrimony profiles |
| `preferences` | Partner matchmaking preferences |
| `considered_sets` | NIS-generated match batches (batch_number, status, expires_at) |
| `candidate_interactions` | Pass / Interest interactions with timestamps |
| `matches` | Confirmed mutual match records |
| `conversations` | Active chat sessions between matched seekers |
| `conversations/{id}/messages` | Real-time message sub-collection |
| `sakinah_reports` | Safety reports (auto-ban at 5 unique reporters) |

---

## API Endpoints

All routes are prefixed under `/api/v1/nis/`.

### Auth
- `POST /auth/register` — Register with email, phone, password
- `POST /auth/login` — Login and receive JWT token

### Profile
- `POST /profile/` — Create or update profile
- `GET /profile/me` — Get own profile

### Preferences
- `GET /preferences/me` — Get partner preferences
- `PUT /preferences/me` — Update partner preferences

### KYC & Liveness
- `POST /kyc/start` — Initiate KYC session
- `GET /kyc/status` — Check KYC status
- `POST /kyc/sandbox/complete` — Complete sandbox KYC (locks verified_gender, verified_age)
- `POST /liveness/start` — Initiate liveness check
- `POST /liveness/sandbox/complete` — Complete sandbox liveness
- `GET /eligibility/me` — Check if user is eligible for matchmaking

### Matchmaking (NIS)
- `GET /considered-few` — Get first batch of NIS-ranked matches
- `GET /next-batch` — Get next batch of ranked candidates (batch 2)
- `GET /candidates/{id}` — Get candidate summary
- `POST /candidates/{id}/pass` — Silently pass a candidate
- `POST /candidates/{id}/interest` — Privately express interest (auto-evaluates mutual)
- `POST /mutual-interest/evaluate` — Check mutual interest state
- `GET /matchflows/{id}` — Get matchflow step
- `POST /matchflows/{id}/decision` — Submit matchflow decision

### Conversations
- `GET /conversations/` — List active conversations
- `GET /conversations/{id}/messages` — Get messages
- `POST /conversations/{id}/messages` — Send a message

### Readiness Questionnaires
- `GET /readiness/home` — Completion status of all 4 phases
- `GET/PUT /niyyah/me` — Intention statement
- `GET/PUT /values/me` — Core values list
- `GET/PUT /mirror/me` — Character self-assessment
- `GET/PUT /portrait/me` — Psychological portrait answers

### Safety & Reporting
- `POST /report/{uid}` — Report a user (auto-bans from Sakinah after 5 unique reports)
- `GET /report-status/{uid}` — Check report count for a user

---

## Environment Variables

Create a `.env` file in the project root:

```
# Database: Firestore (Firebase Admin SDK) — no SQL database used
FIREBASE_CERT_PATH=firebase-credentials.json
JWT_SECRET_KEY=your-secret-key-here
```

---

## Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server (auto-reload watches BACKEND directory)
PYTHONPATH=/path/to/BACKEND \
  uvicorn main:app --app-dir /path/to/BACKEND \
  --host 0.0.0.0 --port 8000 \
  --reload --reload-dir /path/to/BACKEND
```

---

## Deployment (Render)

1. Place `firebase-credentials.json` as a **Secret File** in the Render dashboard at `/etc/secrets/firebase-credentials.json`
2. Set `FIREBASE_CERT_PATH=/etc/secrets/firebase-credentials.json` as an environment variable
3. Set `JWT_SECRET_KEY` as a secret environment variable
4. `render.yaml` handles the rest — no managed database needed

---

## Security Principles

- NIS is called **server-side only** — frontend never touches NIS directly
- `verified_gender` and `verified_age` are **locked at KYC time** — cannot be overridden by frontend
- Private scores, ranks, and psychology labels are **never exposed** to the frontend
- Pass is **silent** — candidate is never notified
- Interest is **private** — only revealed on mutual confirmation
- Sakinah-only ban system — reported users are banned from Sakinah only, not their full account
