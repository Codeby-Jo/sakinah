from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Float
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    education = Column(String(150), nullable=True)
    occupation = Column(String(150), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # KYC Fields added from the feature/kyc branch
    kyc_status = Column(String, default="unverified")
    kyc_verified_at = Column(DateTime(timezone=True), nullable=True)

    religious_details = relationship("ReligiousDetails", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("Preferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    kyc_records = relationship("KYCRecord", back_populates="user", cascade="all, delete-orphan")

class ReligiousDetails(Base):
    __tablename__ = "religious_details"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    prayer_level = Column(String(100), nullable=True)
    quran_reading_level = Column(String(100), nullable=True)
    islamic_knowledge = Column(String(255), nullable=True)
    hijab_status = Column(String(100), nullable=True)
    user = relationship("User", back_populates="religious_details")

class Preferences(Base):
    __tablename__ = "preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_age_min = Column(Integer, nullable=True)
    preferred_age_max = Column(Integer, nullable=True)
    preferred_city = Column(String(100), nullable=True)
    preferred_education = Column(String(150), nullable=True)
    preferred_religious_level = Column(String(100), nullable=True)
    user = relationship("User", back_populates="preferences")

class KYCRecord(Base):
    __tablename__ = "kyc_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_type = Column(String)
    document_url = Column(String)
    selfie_url = Column(String)
    
    verification_status = Column(String, default="pending") # pending, verified, rejected
    verification_score = Column(Float, nullable=True)
    rejection_reason = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="kyc_records")
