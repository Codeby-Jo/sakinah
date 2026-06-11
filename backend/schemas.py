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

class ProfileSetupRequest(BaseModel):
    firstName: str
    lastName: str
    gender: str
    dob: str
    location: str
    height_cm: str
    religion: str
    tradition: str
    islamic_environment_preference: str
    maritalStatus: str
    fatherOccupation: Optional[str] = None
    siblings: Optional[str] = None
    familyDescription: Optional[str] = None
    education: str
    occupation: str
    work_outlook: str
    bio: str
    marriage_readiness: str

class MatchPreferenceRequest(BaseModel):
    minAge: str
    maxAge: str
    locationPref: str
    locationFlexibility: str
    maritalStatus: str
    educationPref: str
    workOutlook: str
    workAfterMarriage: str
    traditionPref: str
    traditionStrictness: str
    religiousPracticePref: str
    islamicEnvPref: str
    learningPref: str
    reminderStyle: str
    familyInvolvement: str
    marriageTimeline: str
    communicationStyle: str
    repairStyle: str
    angerLevel: str
    boundaryStrength: str
    disagreementResponse: str
    familyPressureResponse: str
    accountabilityResponse: str
    personalSpaceResponse: str
    financialDecisionResponse: str
    dealbreakersText: Optional[str] = ""
    strictAge: bool
    strictLocation: bool
    strictTradition: bool
    strictMarital: bool
    noMatchConfirmed: bool

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
