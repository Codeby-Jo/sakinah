from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    """
    User model representing a registered user on the Sakina Matrimony Platform.
    Stores core personal and authentication details.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # Hashed password
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    education = Column(String(150), nullable=True)
    occupation = Column(String(150), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # uselist=False creates a one-to-one relationship
    religious_details = relationship(
        "ReligiousDetails",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
    preferences = relationship(
        "Preferences",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User(id={self.id}, full_name='{self.full_name}', email='{self.email}')>"


class ReligiousDetails(Base):
    """
    ReligiousDetails model representing the religious commitment and practice
    levels of a user. One-to-one relationship with User.
    """
    __tablename__ = "religious_details"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False
    )
    prayer_level = Column(String(100), nullable=True)
    quran_reading_level = Column(String(100), nullable=True)
    islamic_knowledge = Column(String(255), nullable=True)
    hijab_status = Column(String(100), nullable=True)

    # Relationships
    user = relationship("User", back_populates="religious_details")

    def __repr__(self):
        return f"<ReligiousDetails(id={self.id}, user_id={self.user_id}, prayer_level='{self.prayer_level}')>"


class Preferences(Base):
    """
    Preferences model representing the partner preferences of a user.
    One-to-one relationship with User.
    """
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False
    )
    preferred_age_min = Column(Integer, nullable=True)
    preferred_age_max = Column(Integer, nullable=True)
    preferred_city = Column(String(100), nullable=True)
    preferred_education = Column(String(150), nullable=True)
    preferred_religious_level = Column(String(100), nullable=True)

    # Relationships
    user = relationship("User", back_populates="preferences")

    def __repr__(self):
        return f"<Preferences(id={self.id}, user_id={self.user_id}, preferred_city='{self.preferred_city}')>"
