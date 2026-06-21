from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import UserCreate, UserLogin, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
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
        
    import random
    import string
    
    # Generate SAK-XXXXXX format as the primary unique identifier
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    uid = f"SAK-{random_suffix}"
    
    hashed_pwd = hash_password(user_in.password)
    
    user_data = {
        "uid": uid,
        "sak_id": uid, # Kept for backwards compatibility if any frontend code specifically expects it
        "email": user_in.email,
        "name": user_in.name,
        "hashed_password": hashed_pwd,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    try:
        users_ref.document(uid).set(user_data)
        
        # Create a stub in the 'profiles' collection as well so sak_id is globally available
        db.collection("profiles").document(uid).set({
            "uid": uid,
            "sak_id": uid,
            "email": user_in.email,
            "fullName": user_in.name,
            "created_at": datetime.utcnow().isoformat()
        }, merge=True)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database write failed: {str(e)}"
        )
        
    # Generate token so user is automatically logged in after registration
    token_payload = {
        "uid": uid,
        "sak_id": uid,
        "email": user_in.email
    }
    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "id": uid,
        "sak_id": uid,
        "email": user_in.email,
        "name": user_in.name,
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
        "sak_id": user_data.get("sak_id"),
        "email": user_data["email"]
    }
    token = create_access_token(token_payload)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "uid": user_data["uid"],
        "sak_id": user_data.get("sak_id")
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    db = get_db()
    users_ref = db.collection("users")
    
    query = users_ref.where("email", "==", req.email).limit(1).get()
    
    # Anti-enumeration security standard: Always return 200 OK whether email exists or not
    if len(query) > 0:
        user_doc = query[0]
        user_data = user_doc.to_dict()
        
        # Generate short-lived reset token (valid for 15 minutes)
        token_payload = {
            "uid": user_data["uid"],
            "email": user_data["email"],
            "purpose": "password_reset"
        }
        
        to_encode = token_payload.copy()
        expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire, "sub": str(user_data["uid"])})
        
        from app.core.security import SECRET_KEY, ALGORITHM
        reset_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        # In a real app, you would use SendGrid or Firebase Extension to email this link:
        # reset_link = f"http://localhost:5174/matrimony/reset-password?token={reset_token}"
        # send_email(req.email, reset_link)
        
        print(f"DEBUG ONLY: Sent password reset token for {req.email}: {reset_token}")
        
    return {"message": "If an account exists with this email, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    from app.core.security import SECRET_KEY, ALGORITHM
    
    try:
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password_reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token purpose")
            
        uid = payload.get("uid")
        if not uid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token payload")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")
        
    db = get_db()
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    new_hashed_pwd = hash_password(req.new_password)
    user_ref.update({
        "hashed_password": new_hashed_pwd
    })
    
    return {"message": "Password has been successfully updated."}
