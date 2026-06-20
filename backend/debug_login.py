import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/home/joshuaraja/Desktop/SAKINAh/sakinah/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
users_ref = db.collection("users")

email = "ahamed24@gmail.com"
print(f"Querying for {email}...")

try:
    query = users_ref.where("email", "==", email).limit(1).get()
    print(f"Query returned {len(query)} results.")
    if len(query) == 0:
        print("User not found.")
    else:
        user_doc = query[0]
        user_data = user_doc.to_dict()
        print(f"User data: {user_data}")
except Exception as e:
    print(f"EXCEPTION: {e}")
