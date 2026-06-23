from pydantic import BaseModel, Field
from typing import List, Optional

class ProfileCreate(BaseModel):
    # Core 7 Profile Basics
    age: int = 25
    gender: str = "male"
    location: str = ""
    marital_status: str = "never_married"
    education_occupation: str = ""
    religious_practice_and_islamic_home: str = ""
    marriage_readiness: str = "READY"
    
    # Optional fallback fields
    firstName: Optional[str] = ""
    lastName: Optional[str] = ""
    city: Optional[str] = ""
    dateOfBirth: Optional[str] = ""

class ProfileResponse(ProfileCreate):
    uid: str
    sakinah_id: Optional[str] = None
    kyc_verified: bool = False
    is_active: bool = True
    fullName: Optional[str] = None
    first_name: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True
