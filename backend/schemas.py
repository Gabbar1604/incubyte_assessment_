from pydantic import BaseModel, EmailStr
from typing import Optional

# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Sweet schemas
class SweetBase(BaseModel):
    name: str
    category: str
    price: float
    quantity: int
    description: Optional[str] = "Delicious traditional sweet"

class SweetCreate(SweetBase):
    pass

class SweetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    description: Optional[str] = None

class SweetResponse(SweetBase):
    id: int
    
    class Config:
        from_attributes = True

class PurchaseResponse(BaseModel):
    message: str
    sweet: SweetResponse

class RestockRequest(BaseModel):
    quantity: int
