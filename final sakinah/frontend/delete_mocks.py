import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("../../backend/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

profiles = db.collection("profiles").stream()
count = 0
for p in profiles:
    if p.id.startswith("mock_"):
        p.reference.delete()
        count += 1
print(f"Deleted {count} mock profiles.")
