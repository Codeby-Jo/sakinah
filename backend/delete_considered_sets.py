import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/home/joshuaraja/Desktop/SAKINAh/sakinah/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

print("Deleting considered_sets...")
docs = db.collection("considered_sets").get()
count = 0
for doc in docs:
    doc.reference.delete()
    count += 1
print(f"Deleted {count} cached match sets.")
