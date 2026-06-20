import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/home/joshuaraja/Desktop/SAKINAh/sakinah/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

interactions = db.collection("candidate_interactions").get()
print(f"Total interactions: {len(interactions)}")
for doc in interactions:
    data = doc.to_dict()
    print(f"ID: {doc.id} -> Seeker: {data.get('seeker_name')} ({data.get('seeker_id')}), Candidate: {data.get('candidate_name')} ({data.get('candidate_id')}), Status: {data.get('status')}")

conversations = db.collection("conversations").get()
print(f"\nTotal conversations: {len(conversations)}")
for doc in conversations:
    data = doc.to_dict()
    print(f"ID: {doc.id} -> A: {data.get('seeker_a_name')}, B: {data.get('seeker_b_name')}")
