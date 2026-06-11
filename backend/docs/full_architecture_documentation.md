# Sakinah Matrimony: Full Backend Architecture Documentation

## 1. Executive Overview
This document serves as the complete technical blueprint for the Sakinah Matrimony backend platform. The system is built on **FastAPI** to provide lightning-fast API endpoints, powered by **PostgreSQL** via **SQLAlchemy** for robust data integrity, and strictly validates all incoming web traffic using **Pydantic**. 

It successfully merges three massive sub-systems (Core User Data, Identity KYC Verification, and the NIS Matchmaking Engine) into a single, cohesive, enterprise-grade application.

---

## 2. The Professional Folder Structure
The backend strictly adheres to a Corporate Layered Architecture (Controller-Service-Data) pattern to ensure separation of concerns and maximum scalability.

```text
backend/
├── main.py               # The FastAPI Application Entry Point
├── database.py           # The PostgreSQL Connection Engine
├── models.py             # SQLAlchemy ORM Data Tables
├── schemas.py            # Pydantic Data Validation Schemas
├── requirements.txt      # Project Dependencies
│
├── routes/               # The "Controller" Layer (Handles HTTP Web Traffic)
│   ├── auth.py           # Registration & Login endpoints
│   ├── kyc.py            # File Uploads and Verification hooks
│   ├── match.py          # The Matchmaking retrieval endpoint
│   └── profile.py        # User profile management
│
├── services/             # The "Business Logic" Layer
│   └── kyc_service.py    # Complex verification logic isolated from the API
│
├── nis/                  # The "Black-Box" Matchmaker Micro-Engine
│   ├── adapters/         # Converts SQLAlchemy rows to NIS objects
│   ├── engines/          # The 5 core evaluation algorithms
│   ├── models/           # Internal strict data structures for NIS
│   └── services/         # The execution environment
│
├── uploads/              # Secure physical storage for ID documents
├── tests/                # Testing scripts for DB connections and API flows
└── docs/                 # Detailed architectural guides (like this one)
```

---

## 3. Core Files & Their Uses

### `main.py`
The absolute entry point of the server. It boots up the Uvicorn worker, establishes the SQLAlchemy metadata link (`create_all`), and physically mounts the APIRouters from the `routes/` directory into the active web application.

### `database.py`
Manages the SQLAlchemy `engine` and `sessionmaker`. It securely loads the `DATABASE_URL` from the `.env` file to ensure the backend can seamlessly switch between local Docker databases and live production servers without changing code.

### `models.py`
The single source of truth for the PostgreSQL Database schema. It defines:
- **`User`**: Tracks `email`, `password`, and crucially, the `kyc_status` string.
- **`Preferences` & `ReligiousDetails`**: Tables explicitly used to feed data into the matchmaking engine.
- **`KYCRecord`**: A table directly linked to the user via ForeignKey to track their uploaded document paths and verification scores.

### `schemas.py`
The security checkpoint. Every incoming POST/PUT request is forced through these Pydantic classes (e.g., `UserCreate`, `KYCUploadRequest`). If the Frontend sends missing or improperly formatted JSON, FastAPI rejects it with a `422 Unprocessable Entity` before the database is ever touched.

---

## 4. The Routing Layer (Web Controllers)

### `routes/auth.py`
Manages the `/register` endpoint. It accepts Pydantic validated data, attempts to insert it into the `models.User` table, and automatically catches `IntegrityError` exceptions to safely return a `400 Bad Request` if the Frontend submits a duplicate email address.

### `routes/kyc.py`
Manages the `multipart/form-data` required for image uploads. It utilizes FastAPI's `UploadFile` class (powered by `python-multipart`) to stream user IDs and Selfies securely to the `/uploads` directory on disk, and passes the resulting file paths down to the service layer.

### `routes/match.py`
The bridge between the database and the NIS engine. When `GET /matches/{id}` is called, this route acts as a strict Gatekeeper. It queries the database for all available candidates but **strictly filters out anyone whose `kyc_status` is not `"verified"`**. It then passes those verified candidates to the NIS Engine.

---

## 5. The Service Layer (Business Logic)

### `services/kyc_service.py`
Isolates the heavy simulation logic from the web routes. It handles the instantiation of `KYCRecord` database rows and runs a randomized simulation engine to output either a 90%+ confidence score (`verified: true`) or a rejection reason like "Face mismatch" (`verified: false`). It simultaneously updates both the `KYCRecord` and the core `User.kyc_status` in a single SQL transaction.

---

## 6. The NIS Matchmaking Engine Integration
Instead of mixing complex matchmaking code with standard API routes, the NIS system was pulled from the `dev` branch and inserted as an isolated micro-engine. 

**The Adapter Pattern (`nis/adapters/db_to_nis_mapper.py`):**
Because the NIS engine does not understand SQLAlchemy database connections, the backend queries PostgreSQL, formats the rows into simple Python dictionaries, and passes them to the Adapter. The Adapter dynamically translates them into the strict `UserProfile` and `CandidateProfile` objects the NIS Engine demands.

**The Execution:**
The engine then runs the verified candidates through 5 strict layers:
1. Safety Engine
2. Hard Filter Engine
3. Preference Engine
4. Psychology Engine
5. Confidence Engine

It returns a highly curated, privacy-safe list of candidates back to the `routes/match.py` controller.

---

## 7. The End-to-End User Workflow
If a new user signs up, the exact systemic flow is:
1. **Frontend -> `POST /register`**: User submits details. `routes/auth.py` saves them to DB with `kyc_status="unverified"`.
2. **Frontend -> `POST /kyc/upload`**: User uploads passport. `routes/kyc.py` saves images to disk and calls `kyc_service.py` to change status to `pending`.
3. **Frontend -> `POST /kyc/verify`**: System runs identity checks. Updates `User` to `verified`.
4. **Frontend -> `GET /matches/1`**: `routes/match.py` pulls only other `verified` users, maps them via the Adapter, and executes the 5-layer NIS Engine to return final calculated matches. 

*The backend architecture is complete, isolated, heavily validated, and ready for production frontend consumption.*
