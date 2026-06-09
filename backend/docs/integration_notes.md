# End-to-End Integration Notes: Backend & Database

These notes document the exact workflow and technical steps taken to perfectly integrate the Backend APIs with the real PostgreSQL database created by the Database team.

---

## Phase 1: The Initial Backend Setup
Before integrating, we started with a clean, modular FastAPI architecture to ensure separation of concerns:
- **`main.py`**: The core FastAPI application that registers all the routes.
- **`routes/`**: Separated the API endpoints (`auth.py`, `profile.py`, `match.py`) for clean organization.
- **`schemas.py`**: Used Pydantic to validate the JSON data coming from the Frontend.

---

## Phase 2: Pulling the Database Branch
The Database team created complex models (like `ReligiousDetails` and `Preferences`) in a separate branch (`feature/database`). 
To pull their code without causing Git merge conflicts, we used the exact command:
```bash
git fetch origin
git merge origin/feature/database
```
Because the DB team placed their files in the root folder, we cleanly moved `models.py` and `database.py` into our `backend/` directory to keep the project structure unified.

---

## Phase 3: The End-to-End Integration (The Core Work)
This is how we connected the two systems together so they actually function as one cohesive unit.

### 1. Connecting the Database (`database.py`)
- We kept the database team's exact connection logic (`pool_pre_ping=True`, `sessionmaker`).
- **The Trick:** We added `load_dotenv()` to the top of the file. This allowed the backend to read a hidden `.env` file containing our local PostgreSQL password (`postgresql://postgres:password@localhost:5433/sakina_matrimony`) while preserving the Database team's fallback code.

### 2. Upgrading the Pydantic Validation (`schemas.py`)
- The Frontend needed to send more data than before. We expanded `UserCreate` in `schemas.py` to match the exact columns the Database team built.
- We added fields like `full_name`, `gender`, `occupation`, and `city` to ensure FastAPI legally accepted this data in the JSON body.

### 3. Rewiring the APIs (`routes/auth.py`)
- We updated the `@router.post("/register")` API endpoint.
- Instead of saving a basic user, the API now perfectly maps the incoming JSON fields to the advanced SQLAlchemy models (`models.User(full_name=user.full_name, email=user.email, ...)`).
- We used `db.add()`, `db.commit()`, and `db.refresh()` to securely save the user to PostgreSQL.

---

## Phase 4: Cleaning Up Dummy Data
The workflow initially called for a "Dummy NIS" engine to send fake matchmaking data to the frontend.
Since we are preparing for the real NIS engine (developed by Ghaniim), we:
1. Removed all hardcoded fake data ("Fatima", "Ayesha").
2. Kept the `GET /matches/{id}` route active, but returning an empty list `[]`.
3. This ensures the API structure doesn't break, but completely clears out tech debt before the NIS integration.

---

## Phase 5: Verification & Testing
We verified the end-to-end connection in two ways:
1. **Terminal Test**: Ran `python3 test_db.py` to confirm the ORM relationships and cascade deletes worked on the actual PostgreSQL instance.
2. **Server Test**: Ran `python3 -m uvicorn main:app --reload` to start the backend on port 8000. We successfully executed a `POST /register` request through the Swagger UI (`http://127.0.0.1:8000/docs`) and verified it returned a `200 OK` response directly from the database.
