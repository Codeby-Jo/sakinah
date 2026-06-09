"""
Data Flow Explanation:
1. Frontend calls /kyc/upload sending the images and user ID.
2. The images are saved to disk, and a KYCRecord is created referencing these images and the user ID.
3. The backend stores this new KYCRecord in PostgreSQL (via SQLAlchemy) with 'pending' status.
4. It also updates the associated User's kyc_status to 'pending'.
5. When /kyc/verify/{user_id} is called, the system simulates checks.
6. The verification process updates the KYCRecord in PostgreSQL (setting 'verified' or 'rejected' and a score).
7. The User's kyc_status in PostgreSQL is updated to match.
8. NIS checks the get_verified_users() function which only queries users where kyc_status='verified'.
"""

import random
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..models.user_model import User
from ..models.kyc_model import KYCRecord
from ..schemas.kyc_schema import KYCVerificationResponse, KYCStatusResponse
from fastapi import HTTPException

def upload_documents(db: Session, user_id: int, document_type: str, document_url: str, selfie_url: str) -> KYCRecord:
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Backend stores KYC data:
    # A new KYCRecord object is instantiated and added to the session.
    kyc_record = KYCRecord(
        user_id=user_id,
        document_type=document_type,
        document_url=document_url,
        selfie_url=selfie_url,
        verification_status="pending"
    )
    db.add(kyc_record)
    
    # Set user kyc_status to pending
    user.kyc_status = "pending"
    
    db.commit()
    db.refresh(kyc_record)
    return kyc_record

def get_kyc_status(db: Session, user_id: int) -> KYCStatusResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return KYCStatusResponse(user_id=user.id, kyc_status=user.kyc_status)

def verify_identity(db: Session, user_id: int) -> KYCVerificationResponse:
    # Verification updates PostgreSQL:
    # We fetch the relevant records, update their fields, and call db.commit().
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    kyc_record = db.query(KYCRecord).filter(
        KYCRecord.user_id == user_id, 
    ).order_by(KYCRecord.created_at.desc()).first()
    
    if not kyc_record:
        raise HTTPException(status_code=404, detail="No KYC record found for this user")
        
    # Simulate Advanced KYC Logic (Face Match, Age Verification, Document Validation, Duplicate User Detection)
    # We'll randomly pass or fail for simulation purposes
    is_verified = random.choice([True, False])
    
    if is_verified:
        confidence_score = round(random.uniform(90.0, 99.9), 1)
        kyc_record.verification_status = "verified"
        kyc_record.verification_score = confidence_score
        
        user.kyc_status = "verified"
        user.kyc_verified_at = datetime.now(timezone.utc)
        
        response = KYCVerificationResponse(verified=True, confidence_score=confidence_score)
    else:
        reasons = ["Face mismatch", "Document blurred", "Underage", "Duplicate user"]
        reason = random.choice(reasons)
        
        kyc_record.verification_status = "rejected"
        kyc_record.rejection_reason = reason
        user.kyc_status = "rejected"
        
        response = KYCVerificationResponse(verified=False, reason=reason)
        
    db.commit()
    
    return response

# NIS Integration Rule
def get_verified_users(db: Session):
    """
    How NIS checks verified users only:
    NIS must never process users whose KYC status is not verified.
    This helper returns verified users: SELECT * FROM users WHERE kyc_status='verified'
    Only verified users should be eligible for matchmaking.
    """
    return db.query(User).filter(User.kyc_status == 'verified').all()
