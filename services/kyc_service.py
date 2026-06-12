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
        verification_status="verified" # Auto-verify for dev testing
    )
    db.add(kyc_record)
    user.kyc_status = "verified" # Auto-verify for dev testing
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
        
    # ==============================================================================
    # PRODUCTION VENDOR INTEGRATION EXAMPLES 
    # (Show this to your lead to prove how easy it is to swap to real Aadhaar KYC)
    # ==============================================================================
    
    def _verify_with_digilocker_api(aadhaar_number: str, otp: str) -> dict:
        """
        DigiLocker API integration for official Indian Aadhaar Verification.
        Connects directly to government databases via UIDAI authorized channels.
        """
        import requests
        # headers = {
        #     "Authorization": "Bearer YOUR_DIGILOCKER_CLIENT_TOKEN",
        #     "Content-Type": "application/json"
        # }
        # payload = {"aadhaar": aadhaar_number, "otp": otp}
        # response = requests.post("https://api.digitallocker.gov.in/public/oauth2/1/verify_aadhaar", headers=headers, json=payload)
        # return response.json()
        pass

    # For testing, we simulate the vendor response. 
    # In production, replace the random choice below with: 
    # vendor_result = _verify_with_digilocker_api(user_aadhaar, user_otp)
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
