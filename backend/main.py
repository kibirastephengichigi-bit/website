from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import json
import hashlib
import secrets
import os

app = FastAPI(title="Stephen Asatsa Website Admin API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Admin credentials
ADMIN_EMAIL = "admin@stephenasatsa.com"
ADMIN_PASSWORD = "ChangeMe123!"
SECRET_KEY = "your-secret-key-change-in-production"

# Simple token storage (in production, use Redis or database)
tokens = {}

# Models
class AdminLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AdminUser(BaseModel):
    email: str
    role: str
    status: str

# Utility functions
def verify_password(email: str, password: str) -> bool:
    """Simple password verification"""
    return email == ADMIN_EMAIL and password == ADMIN_PASSWORD

def generate_token() -> str:
    """Generate simple token"""
    return secrets.token_urlsafe(32)

def verify_token(token: str) -> bool:
    """Verify token exists and is valid"""
    if token in tokens:
        # Check if token is not expired (24 hours)
        token_data = tokens[token]
        if datetime.now().timestamp() - token_data["created"] < 24 * 60 * 60:
            return True
        else:
            # Remove expired token
            del tokens[token]
    return False

# Routes
@app.get("/")
async def root():
    return {"message": "Stephen Asatsa Website Admin API", "version": "1.0.0"}

@app.post("/api/admin/login", response_model=Token)
async def admin_login(admin_credentials: AdminLogin):
    """Admin login endpoint"""
    if not verify_password(admin_credentials.email, admin_credentials.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Generate and store token
    token = generate_token()
    tokens[token] = {
        "email": admin_credentials.email,
        "created": datetime.now().timestamp()
    }
    
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/admin/me", response_model=AdminUser)
async def get_admin_info(token: str):
    """Get current admin user info"""
    if not verify_token(token):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    
    return AdminUser(
        email=ADMIN_EMAIL,
        role="Administrator",
        status="Active"
    )

@app.post("/api/admin/logout")
async def admin_logout(token: str):
    """Admin logout"""
    if token in tokens:
        del tokens[token]
    return {"message": "Successfully logged out"}

@app.get("/api/admin/stats")
async def get_admin_stats(token: str):
    """Get admin dashboard statistics"""
    if not verify_token(token):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    
    return {
        "total_visitors": 1250,
        "total_pages": 15,
        "total_forms": 8,
        "last_login": datetime.now().isoformat(),
        "system_status": "Healthy",
        "uptime": "99.9%"
    }

@app.get("/api/admin/content")
async def get_content_list(token: str):
    """Get list of manageable content"""
    if not verify_token(token):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    
    return {
        "pages": [
            {"id": 1, "title": "Home Page", "slug": "/", "last_updated": "2024-01-15"},
            {"id": 2, "title": "About Page", "slug": "/about", "last_updated": "2024-01-14"},
            {"id": 3, "title": "Services Page", "slug": "/services", "last_updated": "2024-01-13"},
        ],
        "posts": [
            {"id": 1, "title": "Latest Research", "slug": "/research/latest", "last_updated": "2024-01-12"},
            {"id": 2, "title": "Publications", "slug": "/publications", "last_updated": "2024-01-11"},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
