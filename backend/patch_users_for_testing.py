"""
patch_users_for_testing.py

Finds all existing user profiles in Firestore and marks them as:
- kyc_verified = True
- liveness_verified = True
- kyc_status = "verified"
- liveness_status = "verified"

This lets existing test users (Joshua, Ayesha, etc.) skip the KYC step
and go straight to testing Matches → Mutual Interest → Chat.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore

def patch_users():
    cert_path = "/home/joshuaraja/Desktop/BACKEND/firebase-credentials.json"
    if not os.path.exists(cert_path):
        print(f"Error: {cert_path} not found.")
        return

    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate(cert_path)
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    print("Connected to Firestore...\n")

    # --- Patch profiles ---
    profiles = db.collection("profiles").stream()
    profile_count = 0
    for doc in profiles:
        data = doc.to_dict()
        name = data.get("fullName") or data.get("first_name") or doc.id
        doc.reference.set({
            "kyc_verified": True,
            "liveness_verified": True,
            "kyc_status": "verified",
            "liveness_status": "verified",
            "verified_gender": (data.get("gender") or "male").upper(),
            "verified_age": int(data.get("age") or 25) if str(data.get("age") or "25").isdigit() else 25,
        }, merge=True)
        print(f"  ✅ Patched profile: {name} ({doc.id})")
        profile_count += 1

    if profile_count == 0:
        print("  ⚠️  No profiles found! Register users first via the frontend.")
    else:
        print(f"\n✅ Done — {profile_count} profile(s) patched as KYC Verified.")
        print("   Both users can now see Recommended Matches on the Dashboard.\n")

if __name__ == "__main__":
    patch_users()
