import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def init_firebase():
    """
    Initialize Firebase Admin SDK.
    FAILS FAST — the server will NOT start if Firebase cannot be initialized.
    A silent Firebase failure would make every request fail with an opaque error;
    it is far safer to refuse to start and surface the real problem immediately.
    """
    if firebase_admin._apps:
        return  # Already initialized

    try:
        cert_path = os.getenv("FIREBASE_CERT_PATH")
        if cert_path and os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
        elif os.path.exists("firebase-credentials.json"):
            cred = credentials.Certificate("firebase-credentials.json")
            firebase_admin.initialize_app(cred)
        else:
            # Relies on GOOGLE_APPLICATION_CREDENTIALS env var
            firebase_admin.initialize_app()

        # Smoke-test: confirm Firestore is reachable
        firestore.client()
        print("✅ Firebase Admin initialized and Firestore connection verified.")

    except Exception as e:
        print(f"\n❌ FATAL: Firebase Admin initialization failed: {e}", file=sys.stderr)
        print("   The server cannot start without a valid Firebase connection.", file=sys.stderr)
        print("   Fix the credentials and restart.\n", file=sys.stderr)
        sys.exit(1)  # Hard stop — do NOT boot a broken server


def get_db():
    """Return the Firestore client. Assumes init_firebase() already succeeded."""
    return firestore.client()


def verify_token(token: str):
    """Verify a Firebase Auth ID token. Returns decoded claims or None."""
    try:
        return auth.verify_id_token(token)
    except Exception:
        return None
