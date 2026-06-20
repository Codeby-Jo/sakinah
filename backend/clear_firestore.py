import sys
import os
import firebase_admin
from firebase_admin import credentials, firestore

def clear_db():
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
    print("Connected to Firestore. Deleting collections...")
    
    collections_to_clear = ["profiles", "preferences", "users", "conversations"]
    
    for coll_name in collections_to_clear:
        docs = db.collection(coll_name).stream()
        batch = db.batch()
        count = 0
        for doc in docs:
            batch.delete(doc.reference)
            count += 1
            if count % 500 == 0:
                batch.commit()
                batch = db.batch()
        if count > 0:
            batch.commit()
        print(f"Deleted {count} documents from '{coll_name}'.")

if __name__ == "__main__":
    clear_db()
