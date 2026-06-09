from pydantic import BaseModel
from typing import Optional

class KYCUploadRequest(BaseModel):
    document_type: str
    # Using strings for base64 or URLs if passed as JSON
    # The actual FastAPI route uses UploadFile, but this schema satisfies the requirement
    document_image: str
    selfie_image: str

class KYCVerificationResponse(BaseModel):
    verified: bool
    confidence_score: Optional[float] = None
    reason: Optional[str] = None

class KYCStatusResponse(BaseModel):
    user_id: int
    kyc_status: str
