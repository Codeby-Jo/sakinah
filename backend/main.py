from fastapi import FastAPI
from .database import engine, Base
from .routes import kyc
# Import models to ensure they are registered with Base.metadata before create_all
from .models import user_model, kyc_model

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sakina Matrimony Platform - KYC Module",
    description="Production-ready KYC verification module for NIS.",
    version="1.0.0"
)

app.include_router(kyc.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Sakina Matrimony KYC Module API"}
