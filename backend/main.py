from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.firebase import init_firebase
from app.api import auth, profile, preferences, kyc, matches, conversations, readiness, safety

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Firebase Admin
    init_firebase()
    yield
    # Shutdown logic if necessary

app = FastAPI(
    title="Sakinah Shukr Mode API",
    description="Server-authoritative backend using Firebase Admin and Firestore.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for the frontend module integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Will restrict based on VITE_BACKEND_URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api/v1/nis/auth", tags=["Auth"])
app.include_router(profile.router, prefix="/api/v1/nis/profile", tags=["Profile"])
app.include_router(preferences.router, prefix="/api/v1/nis/preferences", tags=["Preferences"])
app.include_router(kyc.router, prefix="/api/v1/nis", tags=["Identity Verification & KYC"])
app.include_router(matches.router, prefix="/api/v1/nis", tags=["NIS Matchmaking Engine"])
app.include_router(conversations.router, prefix="/api/v1/nis/conversations", tags=["Conversations"])
app.include_router(readiness.router, prefix="/api/v1/nis", tags=["Readiness Questionnaire"])
app.include_router(safety.router, prefix="/api/v1/nis", tags=["Safety & Reporting"])

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "message": "Sakinah Shukr Mode Backend is running. Server-authoritative."
    }
