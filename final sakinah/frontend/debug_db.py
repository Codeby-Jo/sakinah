import firebase_admin
from firebase_admin import credentials, firestore
import json

cred = credentials.Certificate("../../backend/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

profiles = list(db.collection("profiles").stream())
for p in profiles:
    print(p.id, p.to_dict())

preferences = list(db.collection("preferences").stream())
for p in preferences:
    print(p.id, p.to_dict())
