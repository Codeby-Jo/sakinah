from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.firebase import init_firebase
from app.api import auth, profile, preferences, kyc, matches, conversations, readiness, safety

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Firebase Admin (fails fast if broken)
    init_firebase()
    yield
    # Shutdown logic if necessary


app = FastAPI(
    title="Sakinah Shukr Mode API",
    description="Server-authoritative backend using Firebase Admin and Firestore.",
    version="1.0.0",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# CORS — locked to the specific frontend origin.
# allow_origins=["*"] with allow_credentials=True is rejected by browsers AND
# is insecure. We read the allowed origin from the FRONTEND_ORIGIN env var so
# the same codebase works in local dev and production without code changes.
# ---------------------------------------------------------------------------
_frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
_allowed_origins = [_frontend_origin]

# Also allow the Firebase hosting URL if set separately
_firebase_url = os.getenv("FIREBASE_HOSTING_URL", "")
if _firebase_url:
    _allowed_origins.append(_firebase_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# Mount routers
app.include_router(auth.router,          prefix="/api/v1/nis/auth",          tags=["Auth"])
app.include_router(profile.router,       prefix="/api/v1/nis/profile",       tags=["Profile"])
app.include_router(preferences.router,   prefix="/api/v1/nis/preferences",   tags=["Preferences"])
app.include_router(kyc.router,           prefix="/api/v1/nis",               tags=["Identity Verification & KYC"])
app.include_router(matches.router,       prefix="/api/v1/nis",               tags=["NIS Matchmaking Engine"])
app.include_router(conversations.router, prefix="/api/v1/nis/conversations", tags=["Conversations"])
app.include_router(readiness.router,     prefix="/api/v1/nis",               tags=["Readiness Questionnaire"])
app.include_router(safety.router,        prefix="/api/v1/nis",               tags=["Safety & Reporting"])


@app.get("/")
async def health_check():
    return {
        "status": "online",
        "message": "Sakinah Shukr Mode Backend is running. Server-authoritative.",
        "allowed_origins": _allowed_origins,
    }


@app.get("/health")
async def detailed_health():
    """
    Explicit health endpoint — returns DB status so load balancers and
    the team can verify the server is genuinely healthy, not just booted.
    """
    from app.core.firebase import get_db
    try:
        # Lightweight Firestore probe
        get_db().collection("_health").limit(1).get()
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {e}"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "allowed_origins": _allowed_origins,
    }
