from pydantic import BaseModel, EmailStr, Field

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: str = Field("User", description="User's name")

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

# Properties to receive via API on login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Properties to return to client
class UserResponse(UserBase):
    id: str
    is_active: bool
    
    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
