from pydantic import BaseModel, Field
from typing import List, Optional

class MatchPreferenceCreate(BaseModel):
    minAge: str = "18"
    maxAge: str = "100"
    locationPref: List[str] = Field(default_factory=list)
    locationFlexibility: str = ""
    maritalStatus: str = ""
    prefHeightOrPhysical: str = ""
    educationPref: List[str] = Field(default_factory=list)
    religiousPracticePref: str = ""
    familyInvolvement: str = ""
    marriageTimeline: str = ""
    dealbreakers: List[str] = Field(default_factory=list)
    communicationStyle: str = ""
    repairStyle: str = ""
    boundarySafety: str = ""
    lifestyleFinances: str = ""

class MatchPreferenceResponse(MatchPreferenceCreate):
    uid: str
