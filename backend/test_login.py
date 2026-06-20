from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

response = client.post("/api/v1/nis/auth/login", json={"email": "ahamed24@gmail.com", "password": "test"})
print(response.status_code)
print(response.text)
