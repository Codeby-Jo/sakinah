from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.firebase import verify_token

security = HTTPBearer()

import os

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "SAKINAH_SUPER_SECRET_KEY_FOR_JWT_TOKENS")
ALGORITHM = "HS256"

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    # --- DEV OVERRIDE FOR LOCAL SWAGGER TESTING ---
    if token == "dev_test_token":
        return {"uid": "test_user_123", "email": "dev@sakinah.test"}
    # ----------------------------------------------
    
    # 1. Try local JWT validation first (for password-based email login)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if uid:
            return {"uid": uid, "email": payload.get("email"), "auth_type": "local_jwt"}
    except jwt.PyJWTError:
        pass
        
    # 2. Fall back to Firebase ID Token validation
    decoded_token = verify_token(token)
    if decoded_token:
        # Standardize return dictionary
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "auth_type": "firebase"
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
