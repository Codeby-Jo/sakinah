from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import UserCreate, UserLogin, UserResponse
from app.core.firebase import get_db
import uuid
import hashlib
import os
import jwt
from datetime import datetime, timedelta

router = APIRouter()

# Password hashing utilities
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + key.hex()

def verify_password(stored_password: str, provided_password: str) -> bool:
    try:
        salt_hex, key_hex = stored_password.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
        return new_key == key
    except Exception:
        return False

# Token generator
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "sub": str(data.get("uid"))})
    from app.core.security import SECRET_KEY, ALGORITHM
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate):
    db = get_db()
    
    # Check if email already exists
    users_ref = db.collection("users")
    query = users_ref.where("email", "==", user_in.email).limit(1).get()
    if len(query) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
        
    uid = f"user_{str(uuid.uuid4())[:8]}"
    hashed_pwd = hash_password(user_in.password)
    
    user_data = {
        "uid": uid,
        "email": user_in.email,
        "phone_number": user_in.phone_number,
        "hashed_password": hashed_pwd,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    try:
        users_ref.document(uid).set(user_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database write failed: {str(e)}"
        )
        
    # Generate token so user is automatically logged in after registration
    token_payload = {
        "uid": uid,
        "email": user_in.email
    }
    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "id": uid,
        "email": user_in.email,
        "phone_number": user_in.phone_number,
        "is_active": True
    }

@router.post("/login")
async def login_user(user_in: UserLogin):
    db = get_db()
    users_ref = db.collection("users")
    
    query = users_ref.where("email", "==", user_in.email).limit(1).get()
    if len(query) == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    user_doc = query[0]
    user_data = user_doc.to_dict()
    
    stored_password = user_data.get("hashed_password")
    if not stored_password or not verify_password(stored_password, user_in.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    # Generate token
    token_payload = {
        "uid": user_data["uid"],
        "email": user_data["email"]
    }
    token = create_access_token(token_payload)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "uid": user_data["uid"]
    }
