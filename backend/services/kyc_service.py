import random
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from models import User, KYCRecord
from schemas import KYCVerificationResponse, KYCStatusResponse
from fastapi import HTTPException

def upload_documents(db: Session, user_id: int, document_type: str, document_url: str, selfie_url: str) -> KYCRecord:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    kyc_record = KYCRecord(
        user_id=user_id,
        document_type=document_type,
        document_url=document_url,
        selfie_url=selfie_url,
        verification_status="pending"
    )
    db.add(kyc_record)
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
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    kyc_record = db.query(KYCRecord).filter(
        KYCRecord.user_id == user_id, 
    ).order_by(KYCRecord.created_at.desc()).first()
    
    if not kyc_record:
        raise HTTPException(status_code=404, detail="No KYC record found for this user")
        
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

def get_verified_users(db: Session):
    return db.query(User).filter(User.kyc_status == 'verified').all()
