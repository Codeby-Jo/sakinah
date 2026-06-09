from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    created_at: datetime
    kyc_status: str

    class Config:
        from_attributes = True

# KYC Schemas
class KYCUploadRequest(BaseModel):
    document_type: str
    document_image: str
    selfie_image: str

class KYCVerificationResponse(BaseModel):
    verified: bool
    confidence_score: Optional[float] = None
    reason: Optional[str] = None

class KYCStatusResponse(BaseModel):
    user_id: int
    kyc_status: str
