from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # KYC related fields
    kyc_status = Column(String, default="pending") # pending, verified, rejected
    kyc_verified_at = Column(DateTime, nullable=True)
    
    # Relationship to KYC records
    kyc_records = relationship("KYCRecord", back_populates="user")
