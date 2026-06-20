import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("../../backend/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

print("ADAM INTERACTIONS:")
interactions = db.collection("candidate_interactions").where("seeker_id", "==", "user_2e06518e").get()
for doc in interactions:
    print(doc.to_dict())
