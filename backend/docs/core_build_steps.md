# "How did you build the backend and what were the necessary things?"

If your lead asks you this exact question, here is exactly what you should say:

## 1. What were the "Necessary Things" (Our Tech Stack)?
To build this modern, corporate-level backend, I used 7 necessary tools:
1. **Python:** The core programming language.
2. **FastAPI:** The web framework used to actually build the API endpoints (`/register`, `/login`, etc).
3. **Uvicorn:** The server that runs FastAPI so the internet can connect to it.
4. **PostgreSQL:** The database we chose to store all the user profiles securely.
5. **SQLAlchemy:** The Python tool that lets us talk to PostgreSQL without having to write messy, raw SQL queries.
6. **Pydantic:** The strict data-checker tool that guarantees the frontend only sends us perfect data (like making sure an email is actually an email).
7. **python-multipart:** A special tool I had to install so our APIs could successfully accept image uploads for the KYC Passports and Selfies.

## 2. How did you build it? (The 5 Steps)
I built it step-by-step using a clean, layered approach:

* **Step 1 (The Foundation):** I started by setting up the FastAPI app (`main.py`) and building the empty routes so we had a working web server.
* **Step 2 (The Database):** I wired up the PostgreSQL database (`database.py`) and created the data tables for Users, Preferences, and KYC Records using SQLAlchemy (`models.py`).
* **Step 3 (The Shield):** I wrote Pydantic schemas (`schemas.py`) to act as a shield. Now, the backend automatically rejects bad requests before they can crash the database.
* **Step 4 (The KYC System):** I built the logic to handle file uploads, securely save passport images, and update a user's database status from 'unverified' to 'verified'.
* **Step 5 (The Matchmaker):** Finally, I took Ghaniim's complex NIS engine, put it inside our backend, and wrote a rule so that it *only* performs matchmaking on users who have successfully passed KYC verification.
