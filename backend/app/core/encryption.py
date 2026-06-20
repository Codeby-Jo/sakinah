from cryptography.fernet import Fernet
import os

# In a real app, this key comes from a highly secure secret manager.
# We generate a temporary one if none exists in the env for sandbox testing.
_key = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
_cipher_suite = Fernet(_key.encode())

def encrypt_data(data: str) -> str:
    """Encrypts sensitive strings before storing in Firestore."""
    if not data:
        return data
    return _cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    """Decrypts strings for authorized backend use."""
    if not encrypted_data:
        return encrypted_data
    return _cipher_suite.decrypt(encrypted_data.encode()).decode()
