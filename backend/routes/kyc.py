from fastapi import APIRouter, Depends, UploadFile, Form, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import kyc_service
from ..schemas.kyc_schema import KYCStatusResponse, KYCVerificationResponse
import shutil
import os

router = APIRouter(
    prefix="/kyc",
    tags=["kyc"]
)

# Ensure upload directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_kyc(
    user_id: int = Form(...),
    document_type: str = Form(...),
    document_image: UploadFile = File(...),
    selfie_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Data Flow from frontend to backend:
    - Accept document type
    - Accept document image
    - Accept selfie image
    - Store record in database
    - Set user kyc_status to pending
    """
    # Save the uploaded files to disk to generate URLs/paths
    doc_path = os.path.join(UPLOAD_DIR, f"{user_id}_doc_{document_image.filename}")
    with open(doc_path, "wb") as buffer:
        shutil.copyfileobj(document_image.file, buffer)
        
    selfie_path = os.path.join(UPLOAD_DIR, f"{user_id}_selfie_{selfie_image.filename}")
    with open(selfie_path, "wb") as buffer:
        shutil.copyfileobj(selfie_image.file, buffer)
        
    # Store record in database & set user kyc_status to pending via service
    record = kyc_service.upload_documents(
        db=db,
        user_id=user_id,
        document_type=document_type,
        document_url=doc_path,
        selfie_url=selfie_path
    )
    
    return {"message": "KYC documents uploaded successfully", "record_id": record.id}

@router.get("/status/{user_id}", response_model=KYCStatusResponse)
def get_kyc_status(user_id: int, db: Session = Depends(get_db)):
    """
    Return KYC status.
    """
    return kyc_service.get_kyc_status(db=db, user_id=user_id)

@router.post("/verify/{user_id}", response_model=KYCVerificationResponse)
def verify_kyc(user_id: int, db: Session = Depends(get_db)):
    """
    - Simulate KYC verification
    - Update verification status
    - Update verification score
    - Update user kyc_status
    """
    return kyc_service.verify_identity(db=db, user_id=user_id)
