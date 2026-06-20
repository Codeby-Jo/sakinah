import sys
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Setup path so we can import nis
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from nis.mock_data.mock_database import mock_users_data

def seed():
    # 1. Initialize Firebase Admin using service account cert
    cert_path = "/home/joshuaraja/Desktop/BACKEND/firebase-credentials.json"
    if not os.path.exists(cert_path):
        print(f"Error: {cert_path} not found.")
        return
        
    cred = credentials.Certificate(cert_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Connected to Firestore successfully.")

    # 2. Write each mock user into 'profiles' collection
    batch = db.batch()
    profiles_ref = db.collection("profiles")
    
    count = 0
    for user in mock_users_data:
        uid = user["user_id"]
        doc_ref = profiles_ref.document(uid)
        
        # Merge NIS engine fields with frontend fields
        gender = user.get("gender", "MALE")
        marital_status = user.get("marital_status", "NEVER_MARRIED")
        
        # Build merged document
        profile_doc = {
            # Metadata
            "uid": uid,
            "kyc_verified": True,
            "is_active": True,
            "is_banned": user.get("is_banned", False),
            
            # Basic Demographics (Frontend + NIS keys)
            "fullName": user.get("name", f"User {uid}"),
            "first_name": user.get("name", f"User {uid}").split(" ")[0],
            "gender": gender.lower(), # frontend expects lowercase
            "dob": f"{2026 - user.get('age', 25)}-01-01",
            "age": user.get("age", 25),
            "height": str(user.get("height_cm", 170)),
            "height_cm": user.get("height_cm", 170),
            "maritalStatus": marital_status.lower(),
            "marital_status": marital_status,
            "location": user.get("location", "CityB"),
            "city": user.get("location", "CityB"),
            "country": "India",
            "state": "Tamil Nadu",
            
            # Religious details
            "religion": "islam",
            "sect": user.get("tradition", "Sunni"),
            "tradition": user.get("tradition", "Sunni"),
            "prayerStatus": "5_daily",
            "prayer_frequency": "5_daily",
            "religious_practice_level": user.get("religious_practice_level", "MODERATE"),
            "religiousLifestyle": user.get("religious_practice_level", "MODERATE").lower(),
            
            # Career & Education
            "occupation": user.get("occupation", "Engineer").title(),
            "education": user.get("education_level", "BACHELORS"),
            "qualification": user.get("education_level", "BACHELORS").lower(),
            
            # About / Bio
            "bio": f"I am a {user.get('occupation', 'Engineer').lower()} from {user.get('location', 'CityB')}. Looking for a compatible spouse.",
            "bioSnippet": f"I am a {user.get('occupation', 'Engineer').lower()} from {user.get('location', 'CityB')}. Looking for a compatible spouse.",
            
            # Include all original NIS flat fields to be safe
            **user
        }
        
        batch.set(doc_ref, profile_doc, merge=True)
        count += 1
        
        # Commit in batches of 500
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
            
    batch.commit()
    print(f"Successfully seeded {count} mock profiles into Firestore 'profiles' collection.")

if __name__ == "__main__":
    seed()
