import os
from fastapi.testclient import TestClient
from app.main import app
from app.api.auth import create_access_token

client = TestClient(app)

def test_wali_matchmaking():
    # 1. Create a token for a mock user
    uid = "test_wali_user_123"
    token = create_access_token({"uid": uid, "email": "wali@example.com"})
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add profile
    profile_payload = {
        "age": 25,
        "gender": "female",
        "location": "London",
        "marital_status": "never_married",
        "education_occupation": "engineer",
        "religious_practice_and_islamic_home": "PRACTICING",
        "marriage_readiness": "READY",
        "firstName": "Test",
        "lastName": "Wali"
    }
    client.put("/profile", json=profile_payload, headers=headers)

    # 3. Mark KYC verified (simulate backend admin action)
    from app.core.firebase import get_db
    db = get_db()
    db.collection("profiles").document(uid).update({"kyc_verified": True})

    # 4. Add preferences with Wali involvement
    preferences_payload = {
        "pref_age_range": {"min": 20, "max": 30},
        "familyInvolvement": "FAMILY LED",
        "pref_location": [],
        "pref_marital_status": "NO_STRICT_PREFERENCE"
    }
    client.post("/preferences", json=preferences_payload, headers=headers)

    # 5. Get considered few
    response = client.get("/considered-few", headers=headers)
    print("Response status:", response.status_code)
    print("Response JSON:", response.json())

if __name__ == "__main__":
    test_wali_matchmaking()
