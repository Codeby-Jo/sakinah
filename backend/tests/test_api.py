from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import get_db, Base
import uuid

# Setup SQLite for Testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_read_main():
    response = client.get("/docs")
    assert response.status_code == 200

def test_register_user():
    random_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/register",
        json={
            "full_name": "Unit Test User",
            "email": random_email,
            "password": "testpassword",
            "age": 25,
            "gender": "Female",
            "city": "London",
            "education": "Bachelors",
            "occupation": "Engineer"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == random_email
    assert data["kyc_status"] == "unverified"

def test_login_user():
    response = client.post(
        "/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Login successful"}

def test_get_kyc_status_not_found():
    response = client.get("/kyc/status/999999")
    assert response.status_code == 404
