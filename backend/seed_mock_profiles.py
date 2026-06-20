import os
import sys
import uuid
from datetime import datetime
import random

# Setup path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.firebase import get_db, init_firebase

init_firebase()
db = get_db()

# Names for mock generation
MALE_NAMES = ["Ahmad", "Ali", "Hassan", "Ibrahim", "Tariq", "Zaid", "Bilal", "Yusuf", "Hamza", "Kareem", "Samir", "Zane", "Faris", "Rayyan"]
FEMALE_NAMES = ["Aisha", "Fatima", "Khadija", "Zainab", "Mariam", "Hafsa", "Ruqayyah", "Sara", "Nour", "Yasmin", "Layla", "Amina", "Salma", "Hana", "Dina"]

LOCATIONS = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]
PROFESSIONS = ["Software Engineer", "Doctor", "Teacher", "Business Analyst", "Architect", "Designer", "Entrepreneur", "Accountant"]

def generate_mock_profile(gender, name):
    uid = f"mock_{uuid.uuid4().hex[:12]}"
    age = random.randint(22, 35)
    location = random.choice(LOCATIONS)
    profession = random.choice(PROFESSIONS)
    
    user_data = {
        "uid": uid,
        "email": f"{name.lower()}_{age}_{uid[:4]}@mock.sakinah.com",
        "name": name,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "is_mock": True
    }
    
    profile_data = {
        "firstName": name,
        "lastName": "Mock",
        "age": str(age),
        "gender": gender,
        "city": location,
        "location": location,
        "education_occupation": f"{profession} / Graduate",
        "marital_status": "Never Married",
        "religious_practice_level": random.choice(["MODERATE", "STRICT", "LIBERAL"]),
        "sect": "Sunni",
        "prayerFrequency": "5_daily",
        "bio": f"Hi, I'm {name}. I work as a {profession} in {location}. Looking for a meaningful connection based on Islamic values.",
        "kyc_verified": True,
        "sakinah_banned": False,
        "verified_gender": gender.upper(),
        "verified_age": age,
        "is_mock": True
    }
    
    pref_data = {
        "uid": uid,
        "prefAgeMin": max(18, age - 5),
        "prefAgeMax": age + 5,
        "prefLocations": [location],
        "prefMaritalStatus": ["Never Married"],
        "prefReligiousAlignment": "Required",
        "prefCommunicationStyle": random.choice(["Calm", "Direct", "Open"]),
        "prefFamilyInvolvement": random.choice(["Early", "Later"]),
        "prefEducationWork": ["Graduate"],
        "strictDealbreakers": [],
        "marriageTimeline": "Within 1 year",
        "prefHeightOrPhysical": "No preference",
        "locationFlexibility": "Open to relocation"
    }
    
    return uid, user_data, profile_data, pref_data

def run():
    print("Deleting old mock profiles and preferences...")
    users = db.collection("users").where("is_mock", "==", True).get()
    for u in users:
        db.collection("users").document(u.id).delete()
        
    profiles = db.collection("profiles").where("is_mock", "==", True).get()
    for p in profiles:
        db.collection("profiles").document(p.id).delete()
        # also delete preferences for this user
        db.collection("preferences").document(p.id).delete()
        
    print("Generating 50 new mock profiles (25 male, 25 female)...")
    batch = db.batch()
    
    for _ in range(25):
        # Male
        m_name = random.choice(MALE_NAMES)
        uid, u_data, p_data, pref_data = generate_mock_profile("MALE", m_name)
        batch.set(db.collection("users").document(uid), u_data)
        batch.set(db.collection("profiles").document(uid), p_data)
        batch.set(db.collection("preferences").document(uid), pref_data)
        
        # Female
        f_name = random.choice(FEMALE_NAMES)
        uid, u_data, p_data, pref_data = generate_mock_profile("FEMALE", f_name)
        batch.set(db.collection("users").document(uid), u_data)
        batch.set(db.collection("profiles").document(uid), p_data)
        batch.set(db.collection("preferences").document(uid), pref_data)
        
    batch.commit()
    print("Done! 50 mock profiles created.")

if __name__ == "__main__":
    run()
