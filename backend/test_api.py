import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db, User
from main import app
from auth import get_password_hash

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    
    # Create admin user for tests
    db = TestingSessionLocal()
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
    db.close()
    
    yield
    Base.metadata.drop_all(bind=engine)

# ==================== AUTH TESTS ====================

def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "test123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_register_duplicate_username():
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "test123"}
    )
    response = client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "other@example.com", "password": "test123"}
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_login_success():
    # Register first
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "test123"}
    )
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "test123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testuser"

def test_login_wrong_password():
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "test123"}
    )
    
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401

# ==================== SWEET TESTS (PUBLIC) ====================

def test_get_all_sweets():
    response = client.get("/api/sweets")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search_sweets_by_name():
    # Add a sweet first (need admin token)
    # For now, test the endpoint structure
    response = client.get("/api/sweets/search?name=Kaju")
    assert response.status_code == 200

def test_search_sweets_by_price_range():
    response = client.get("/api/sweets/search?min_price=100&max_price=500")
    assert response.status_code == 200

# ==================== SWEET TESTS (PROTECTED) ====================

def get_auth_token():
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "test123"}
    )
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "test123"}
    )
    return response.json()["access_token"]

def get_admin_token():
    # Use the default admin credentials
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    return response.json()["access_token"]

def test_purchase_sweet_without_auth():
    response = client.post("/api/sweets/1/purchase")
    assert response.status_code == 403  # Unauthorized

def test_purchase_sweet_with_auth():
    token = get_auth_token()
    
    # Add a sweet first
    admin_token = get_admin_token()
    client.post(
        "/api/sweets",
        json={"name": "Test Sweet", "category": "Test", "price": 100, "quantity": 5},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Purchase
    response = client.post(
        "/api/sweets/1/purchase",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Purchased successfully"

def test_purchase_out_of_stock():
    token = get_auth_token()
    admin_token = get_admin_token()
    
    # Add sweet with 0 quantity
    client.post(
        "/api/sweets",
        json={"name": "Out of Stock", "category": "Test", "price": 100, "quantity": 0},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    response = client.post(
        "/api/sweets/1/purchase",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "Out of stock" in response.json()["detail"]

# ==================== ADMIN TESTS ====================

def test_add_sweet_as_admin():
    token = get_admin_token()
    
    response = client.post(
        "/api/sweets",
        json={"name": "New Sweet", "category": "Traditional", "price": 200, "quantity": 10},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Sweet"
    assert data["category"] == "Traditional"

def test_add_sweet_as_regular_user():
    token = get_auth_token()
    
    response = client.post(
        "/api/sweets",
        json={"name": "New Sweet", "category": "Traditional", "price": 200, "quantity": 10},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403  # Forbidden

def test_update_sweet():
    token = get_admin_token()
    
    # Add sweet
    response = client.post(
        "/api/sweets",
        json={"name": "Test Sweet", "category": "Test", "price": 100, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = response.json()["id"]
    
    # Update sweet
    response = client.put(
        f"/api/sweets/{sweet_id}",
        json={"price": 150, "quantity": 10},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["price"] == 150
    assert response.json()["quantity"] == 10

def test_delete_sweet():
    token = get_admin_token()
    
    # Add sweet
    response = client.post(
        "/api/sweets",
        json={"name": "Test Sweet", "category": "Test", "price": 100, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = response.json()["id"]
    
    # Delete sweet
    response = client.delete(
        f"/api/sweets/{sweet_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 204

def test_restock_sweet():
    token = get_admin_token()
    
    # Add sweet
    response = client.post(
        "/api/sweets",
        json={"name": "Test Sweet", "category": "Test", "price": 100, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    sweet_id = response.json()["id"]
    
    # Restock
    response = client.post(
        f"/api/sweets/{sweet_id}/restock",
        json={"quantity": 10},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["quantity"] == 15  # 5 + 10
