import sys
import os
sys.path.append("/home/joshuaraja/Downloads/sakinahh/frontend/backend")
from database import SessionLocal
from models import User
from routes.match import generate_matches
from fastapi import Request
from models import Preferences, PsychologicalProfile

class MockUser:
    id = 2
    full_name = "Test User"
    age = 28
    gender = "MALE"
    city = "Test City"
    education = "BACHELORS"
    occupation = "Engineer"
    kyc_status = "verified"
    is_banned = False
    safety_status = "CLEAR"
    
    class MockPreferences:
        marital_status = "NEVER_MARRIED"
        work_outlook = "WORKING"
        islamic_env_pref = "MODERATE"
        preferred_religious_level = "HIGH"
        tradition_pref = "Sunni-Hanafi"
        preferred_age_min = 25
        preferred_age_max = 32
        preferred_city = "Test City"
        preferred_education = "BACHELORS"
        strict_age = False
        strict_location = False
        strict_tradition = False
        strict_marital = False
        family_involvement = "AFTER_MUTUAL_INTEREST"
        dealbreakers_text = None
        no_match_confirmed = False
    
    class MockPsychProfile:
        communication_style = "CALM"
        attachment_style = "SECURE"
        marriage_readiness = "READY"
        conflict_resolution = "COMPROMISE"
        financial_expectations = "TRANSPARENCY_AND_PLANNING"
        living_arrangements = "JOINT"
        anger_level = "LOW"
        boundary_strength = "STRONG"
        emotional_steadiness = "STEADY"
        financial_responsibility = "CAREFUL"
        lifestyle_pattern = "STRUCTURED"
        disagreement_response = "FAIR_SOLUTION"
        family_pressure_response = "BALANCE_AND_PROTECT_FAIRNESS"
        accountability_response = "APOLOGIZE_AND_REPAIR"
        personal_space_response = "HEALTHY_SPACE_IMPORTANT"
    
    preferences = MockPreferences()
    psychological_profile = MockPsychProfile()

if __name__ == "__main__":
    db = SessionLocal()
    res = generate_matches(current_user=MockUser(), db=db)
    print("API RESULT:", res)
