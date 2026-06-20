import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("../../backend/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

print("PROFILES:")
profiles = db.collection("profiles").stream()
for p in profiles:
    data = p.to_dict()
    name = data.get("first_name", "").lower()
    if "adam" in name or "sara" in name:
        print(f"[{p.id}] {data}")
