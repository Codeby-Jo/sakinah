# Sakinah Platform

Sakinah is an advanced, algorithmically driven matchmaking platform built with modern web technologies. This repository is structured as a **Monorepo**, housing both the frontend client and the backend AI matching engine.

## Corporate Repository Structure

```text
sakinah-platform/
├── web-frontend/         # React + Vite Client Application
│   ├── src/              # UI Components, Pages, and Global State
│   ├── e2e/              # Playwright End-to-End Tests
│   └── package.json      # Node.js dependencies
│
├── backend/              # FastAPI Python Server & NIS Engine
│   ├── routes/           # API Endpoints (Auth, Profile, Match, KYC)
│   ├── nis/              # Core Matchmaking Algorithm & Psychology Engine
│   ├── database.py       # SQLite / PostgreSQL configuration
│   └── requirements.txt  # Python dependencies
│
└── README.md             # Project Overview
```

## Running the Project Locally

### 1. Start the Backend API (Terminal 1)
The backend uses FastAPI and runs the NIS Matchmaking Engine.
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```
*The API will run at http://localhost:8000*

### 2. Start the Web Frontend (Terminal 2)
The frontend is a React application built with Vite and TailwindCSS.
```bash
cd web-frontend
npm install
npm run dev
```
*The frontend will run at http://localhost:5173*

## Core Architecture Highlights
* **NIS Engine**: An independent Python package (`nis/`) integrated into the FastAPI backend that utilizes Psychological and Demographic gating to filter and score matches.
* **Security-First KYC**: Simulated Document + Selfie verification integration to protect the platform.
* **JWT Authentication**: Full Bearer token integration across all API requests.
* **Component-Driven UI**: Highly reusable React components styled professionally via TailwindCSS.
