from cryptography.fernet import Fernet
import os
import sys

# ---------------------------------------------------------------------------
# Encryption key MUST come from the environment.
# Generating a new key on every boot means all previously encrypted data
# becomes permanently unreadable after a restart — that is data loss.
#
# To generate a key (run once, store securely):
#   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
#
# Then set:  ENCRYPTION_KEY=<the key>  in your .env / Render secret
# ---------------------------------------------------------------------------

_raw_key = os.getenv("ENCRYPTION_KEY")

if not _raw_key:
    print(
        "\n❌ FATAL: ENCRYPTION_KEY environment variable is not set.\n"
        "   Generate a key with:\n"
        "     python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"\n"
        "   Then add it to your .env file or Render secret environment.\n",
        file=sys.stderr,
    )
    sys.exit(1)

try:
    _cipher_suite = Fernet(_raw_key.encode())
except Exception as e:
    print(f"\n❌ FATAL: ENCRYPTION_KEY is invalid: {e}\n", file=sys.stderr)
    sys.exit(1)


def encrypt_data(data: str) -> str:
    """Encrypts a string before storing in Firestore."""
    if not data:
        return data
    return _cipher_suite.encrypt(data.encode()).decode()


def decrypt_data(encrypted_data: str) -> str:
    """Decrypts a Firestore-stored encrypted string."""
    if not encrypted_data:
        return encrypted_data
    return _cipher_suite.decrypt(encrypted_data.encode()).decode()
