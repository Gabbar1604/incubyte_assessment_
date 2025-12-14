from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional

from database import get_db, init_db, User, Sweet
from schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    SweetCreate, SweetUpdate, SweetResponse, PurchaseResponse, RestockRequest
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(
    title="Sweet Shop Management System",
    description="A comprehensive inventory and sales management system for sweet shops",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    db = next(get_db())
    
    # Create admin user if not exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin_user = User(
            username="admin",
            email="admin@sweetshop.com",
            hashed_password=get_password_hash("admin123"),
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
    
    # Initialize sweet inventory with sample data
    if db.query(Sweet).count() == 0:
        initial_sweets = [
            Sweet(name="Kaju Katli", category="Dry Sweet", price=500, quantity=8, description="Premium cashew based sweet"),
            Sweet(name="Ladoo", category="Traditional", price=100, quantity=0, description="Classic besan ladoo"),
            Sweet(name="Gulab Jamun", category="Syrup Based", price=150, quantity=20, description="Soft milk solid balls in sugar syrup"),
            Sweet(name="Rasgulla", category="Syrup Based", price=120, quantity=15, description="Spongy cottage cheese balls"),
            Sweet(name="Barfi", category="Dry Sweet", price=300, quantity=10, description="Traditional milk fudge"),
        ]
        db.add_all(initial_sweets)
        db.commit()

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

# ==================== SWEET ENDPOINTS (PUBLIC) ====================

@app.get("/api/sweets", response_model=List[SweetResponse])
def get_all_sweets(db: Session = Depends(get_db)):
    sweets = db.query(Sweet).all()
    return sweets

@app.get("/api/sweets/search", response_model=List[SweetResponse])
def search_sweets(
    name: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Sweet)
    
    if name:
        query = query.filter(Sweet.name.contains(name))
    if category:
        query = query.filter(Sweet.category.contains(category))
    if min_price is not None:
        query = query.filter(Sweet.price >= min_price)
    if max_price is not None:
        query = query.filter(Sweet.price <= max_price)
    
    return query.all()

@app.get("/api/sweets/{sweet_id}", response_model=SweetResponse)
def get_sweet(sweet_id: int, db: Session = Depends(get_db)):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    return sweet

# ==================== SWEET ENDPOINTS (PROTECTED) ====================

@app.post("/api/sweets/{sweet_id}/purchase", response_model=PurchaseResponse)
def purchase_sweet(
    sweet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    if sweet.quantity <= 0:
        raise HTTPException(status_code=400, detail="Out of stock")
    
    sweet.quantity -= 1
    db.commit()
    db.refresh(sweet)
    
    return {"message": "Purchased successfully", "sweet": sweet}

# ==================== ADMIN ENDPOINTS ====================

@app.post("/api/sweets", response_model=SweetResponse, status_code=status.HTTP_201_CREATED)
def add_sweet(
    sweet: SweetCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    new_sweet = Sweet(**sweet.dict())
    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)
    return new_sweet

@app.put("/api/sweets/{sweet_id}", response_model=SweetResponse)
def update_sweet(
    sweet_id: int,
    sweet_update: SweetUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    update_data = sweet_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sweet, key, value)
    
    db.commit()
    db.refresh(sweet)
    return sweet

@app.delete("/api/sweets/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet(
    sweet_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    db.delete(sweet)
    db.commit()
    return None

@app.post("/api/sweets/{sweet_id}/restock", response_model=SweetResponse)
def restock_sweet(
    sweet_id: int,
    restock: RestockRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    sweet.quantity += restock.quantity
    db.commit()
    db.refresh(sweet)
    return sweet
