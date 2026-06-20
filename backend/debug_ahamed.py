import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/home/joshuaraja/Desktop/SAKINAh/sakinah/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

a = db.collection("profiles").document("user_695245b2").get()
if a.exists: print(a.to_dict())
