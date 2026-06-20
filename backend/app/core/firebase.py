import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
# In development, it uses the GOOGLE_APPLICATION_CREDENTIALS env var or a service account JSON
# Since we shouldn't commit secrets, ensure you have a throwaway Firebase project set up.

def init_firebase():
    if not firebase_admin._apps:
        # Initialize with default credentials or a specific cert if provided
        try:
            # If FIREBASE_CERT_PATH is in .env, use it
            cert_path = os.getenv("FIREBASE_CERT_PATH")
            if cert_path and os.path.exists(cert_path):
                cred = credentials.Certificate(cert_path)
                firebase_admin.initialize_app(cred)
            else:
                # Default init (relies on GOOGLE_APPLICATION_CREDENTIALS)
                firebase_admin.initialize_app()
            print("Firebase Admin initialized successfully.")
        except Exception as e:
            print(f"Warning: Firebase Admin initialization failed: {e}")

# Get Firestore DB instance
def get_db():
    return firestore.client()

# Verify Firebase Auth Token
def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None
