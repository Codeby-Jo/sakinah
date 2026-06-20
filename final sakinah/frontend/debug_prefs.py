import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("../../backend/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

print("ADAM PREFERENCES:")
adam = db.collection("preferences").document("user_2e06518e").get()
print(adam.to_dict())

print("SARA PREFERENCES:")
sara = db.collection("preferences").document("user_08f956e4").get()
print(sara.to_dict())
