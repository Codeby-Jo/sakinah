# Sakinah Matrimony - MNC Submission

This repository contains the full-stack architecture for the Sakinah Matrimony platform, specifically structured for professional code review, investor submissions, and MNC handoffs.

## Architecture Overview

The system is split into two perfectly decoupled architectures:
1. **Frontend (Vite + React)**: The high-fidelity, high-trust UI built with strict UI/UX constraints.
2. **Backend (Python + FastAPI)**: The server-authoritative matchmaking NIS Engine and Auth handler.
3. **Database**: Google Firebase Firestore (Server-side initialized).

---

## Directory Structure

```text
Sakinah_Submission/
├── backend/            # Python FastAPI Backend Architecture
│   ├── app/            # Core Application (Auth, KYC, API Routes)
│   ├── nis/            # NIS Matchmaking Intelligence Engine
│   └── main.py         # Entrypoint
│
├── frontend/           # React Vite Frontend Architecture
│   ├── src/            # Core React Components & Contexts
│   ├── vite.config.ts  # Build & Proxy Config
│   └── package.json    # Dependencies
│
└── docs/               # Technical Documentation
```

---

## How to Run the Environment

### 1. Start the Backend Server (Terminal 1)
The backend manages all data, handles matchmaking, and securely interacts with Firestore.

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*API Documentation will be instantly available at: `http://localhost:8000/docs`*

### 2. Start the Frontend Server (Terminal 2)
The frontend serves the user interfaces and proxies all API requests directly to the FastAPI server.

```bash
cd frontend
npm install
npm run dev
```
*The app will be instantly available at: `http://localhost:5173/matrimony/register`*

---

## Code Review Highlights
- **Zero Firebase Auth SDK on Frontend**: We deliberately handle JWT issuance and verification on the backend to prevent reverse engineering.
- **Server-Authoritative Matchmaking**: The `nis/` engine strictly controls match calculations in memory to prevent frontend scraping.
- **Strict Typing**: The frontend explicitly defines Pydantic-compatible TypeScript schemas.
