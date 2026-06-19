from pydantic import BaseModel, Field
from typing import Optional

class ExtractedIdentityData(BaseModel):
    name: str
    age: int
    gender: str

class KYCSubmission(BaseModel):
    session_token: str = Field(..., description="The KYC session token to verify")
    # In sandbox, the frontend can pass mock extracted data
    mock_extracted_data: Optional[ExtractedIdentityData] = None

class KYCResponse(BaseModel):
    uid: str
    status: str
    message: str
