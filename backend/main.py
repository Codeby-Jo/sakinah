from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routes import auth, profile, match, kyc

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sakinah NIS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(match.router)
app.include_router(kyc.router)

@app.get("/")
def read_root():
    return {"message": "Sakinah NIS API is running. Go to /docs for Swagger UI."}
