# Sakinah · Shukr Mode — Build Handoff

> **This is the trimmed ("lean core") handoff.** It keeps auth, routing,
> onboarding, connections, profile, navigation/design-system, and supporting
> infrastructure — plus the features the core depends on (Raya, Quran, wallet,
> KYC scaffolding). The standalone commercial verticals (trading, banking,
> real-estate, souk, commerce, screener, shark-tank, admin, matrimony, etc. —
> 29 features) were removed. The shell type-checks (`tsc`) and builds
> (`vite build`) cleanly as shipped.

This is the **app shell you build on**. Your job is to add a new
`frontend/src/features/sakinah/` module and the **Python + FastAPI** backend
that powers it. Read the two briefs in this folder **first**:

- `Sakinah_Build_Brief.pdf` — your scope, boundaries, and the non-negotiable rules.
- `Sakinah_KYC_Brief.pdf` — what identity verification must achieve.

> The briefs give you the boundary and the rules — **not** the method. The
> architecture, data model, vendor integration, and build order are yours.

## What's in this package

```
.firebaserc              ← templated; point at YOUR throwaway Firebase project
firebase.json            ← hosting / firestore / storage / functions config
firestore.rules          ← existing security rules (extend; do not weaken)
firestore.indexes.json
storage.rules
frontend/                ← the running app shell (React + Vite + TS)
  src/features/...       ← existing features incl. auth, onboarding, connections
  .env.local.template    ← copy to .env.local and fill from your dev project
```

> Firebase Cloud Functions are intentionally **not** included — all of your
> Sakinah matching/safety/verification logic lives in the Python + FastAPI
> backend you build. (The `functions` block was removed from `firebase.json`.)

There is **no `features/sakinah/` and no Python backend here** — those are
what you build.

## Getting started

```bash
cd frontend
cp .env.local.template .env.local      # then paste your throwaway-project web config
npm install
npm run dev
```

The frontend reaches your backend via `VITE_BACKEND_URL` in `.env.local`.

## Hard boundaries (from the briefs — read them in full)

- **Reuse** the shell's auth, routing, Firebase config, and design system.
- **Do not touch** the existing `connections` feature.
- **Server-authoritative:** the backend verifies the Firebase Auth token and owns
  every sensitive write (matches, signals, safety, verification status). Clients
  must never write match/safety data or decide who is shown — it must be
  *impossible from the client*, not just hidden in the UI.
- **Backend stack is Python + FastAPI.** Not negotiable.
- **Throwaway project only.** No production access. **No real PII in dev** — use
  the KYC sandbox. **Never commit** secrets, service-account keys, `node_modules`,
  `.env.local`, or any real identity data / uploaded documents.
- **No paid AI** (Raya is scripted for v1).
- Honour the product's "must never" list: no swipe, no feed, no public profiles,
  no photo before mutual interest, no rejection notifications, no "riya engine."
  Character-first, women-first safety.

## Delivering your work

Hand back a patch or a zip of **only the files you changed**. Never include
secrets, `node_modules`, service-account keys, the database, or uploaded documents.
