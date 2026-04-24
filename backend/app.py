from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import secrets
import json
import hashlib
import re

app = Flask(__name__)
CORS(app, origins=["http://localhost:3001", "http://localhost:3000"])

# Admin credentials
ADMIN_EMAIL = "admin@stephenasatsa.com"
ADMIN_PASSWORD = "ChangeMe123!"

# Simple storage (in production, use database)
tokens = {}
users = {}
user_profiles = {}

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(email: str, password: str) -> bool:
    """Verify password for admin or regular user"""
    if email == ADMIN_EMAIL:
        return password == ADMIN_PASSWORD
    elif email in users:
        return users[email]["password"] == hash_password(password)
    return False

def generate_token() -> str:
    """Generate simple token"""
    return secrets.token_urlsafe(32)

def verify_token(token: str) -> dict:
    """Verify token exists and is valid, return user data"""
    if token in tokens:
        # Check if token is not expired (24 hours)
        token_data = tokens[token]
        if datetime.now().timestamp() - token_data["created"] < 24 * 60 * 60:
            return token_data
        else:
            # Remove expired token
            del tokens[token]
    return None

def is_valid_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_password(password: str) -> bool:
    """Validate password strength"""
    return len(password) >= 8 and any(c.isupper() for c in password) and any(c.islower() for c in password) and any(c.isdigit() for c in password)

@app.route("/")
def root():
    return jsonify({"message": "Stephen Asatsa Website Admin API", "version": "1.0.0"})

# Authentication endpoints
@app.route("/api/auth/signup", methods=["POST"])
def user_signup():
    """User signup endpoint"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "")
        
        # Validation
        if not email or not password:
            return jsonify({"detail": "Email and password are required"}), 400
        
        if not is_valid_email(email):
            return jsonify({"detail": "Invalid email format"}), 400
        
        if not is_valid_password(password):
            return jsonify({"detail": "Password must be at least 8 characters with uppercase, lowercase, and numbers"}), 400
        
        # Check if user already exists
        if email in users:
            return jsonify({"detail": "User already exists"}), 409
        
        # Create new user
        users[email] = {
            "email": email,
            "password": hash_password(password),
            "name": name,
            "created_at": datetime.now().isoformat(),
            "role": "user",
            "status": "active"
        }
        
        user_profiles[email] = {
            "preferences": {
                "newsletter": False,
                "notifications": True,
                "theme": "light"
            },
            "saved_items": [],
            "last_login": None
        }
        
        # Generate token
        token = generate_token()
        tokens[token] = {
            "email": email,
            "created": datetime.now().timestamp(),
            "role": "user"
        }
        
        return jsonify({
            "message": "User created successfully",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "name": name,
                "role": "user"
            }
        })
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/auth/login", methods=["POST"])
def user_login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"detail": "Email and password are required"}), 400
        
        if not verify_password(email, password):
            return jsonify({"detail": "Invalid email or password"}), 401
        
        # Generate token
        token = generate_token()
        user_role = "admin" if email == ADMIN_EMAIL else "user"
        
        tokens[token] = {
            "email": email,
            "created": datetime.now().timestamp(),
            "role": user_role
        }
        
        # Update last login
        if email in user_profiles:
            user_profiles[email]["last_login"] = datetime.now().isoformat()
        
        return jsonify({
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "name": users.get(email, {}).get("name", ""),
                "role": user_role
            }
        })
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/auth/me")
def get_current_user():
    """Get current user info"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    email = token_data["email"]
    role = token_data["role"]
    
    if role == "admin":
        return jsonify({
            "email": ADMIN_EMAIL,
            "name": "Administrator",
            "role": "admin",
            "status": "Active"
        })
    else:
        user_data = users.get(email, {})
        profile_data = user_profiles.get(email, {})
        
        return jsonify({
            "email": email,
            "name": user_data.get("name", ""),
            "role": "user",
            "status": user_data.get("status", "active"),
            "created_at": user_data.get("created_at"),
            "preferences": profile_data.get("preferences", {}),
            "saved_items": profile_data.get("saved_items", [])
        })

@app.route("/api/auth/logout", methods=["POST"])
def user_logout():
    """User logout"""
    token = request.args.get("token")
    if token in tokens:
        del tokens[token]
    return jsonify({"message": "Successfully logged out"})

@app.route("/api/auth/update-profile", methods=["PUT"])
def update_profile():
    """Update user profile"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    email = token_data["email"]
    data = request.get_json()
    
    if email in user_profiles:
        # Update preferences
        if "preferences" in data:
            user_profiles[email]["preferences"].update(data["preferences"])
        
        # Update name if provided
        if "name" in data and email in users:
            users[email]["name"] = data["name"]
        
        return jsonify({"message": "Profile updated successfully"})
    
    return jsonify({"detail": "User not found"}), 404

@app.route("/api/auth/saved-items", methods=["GET", "POST", "DELETE"])
def manage_saved_items():
    """Manage saved items"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    email = token_data["email"]
    
    if email not in user_profiles:
        return jsonify({"detail": "User not found"}), 404
    
    if request.method == "GET":
        return jsonify({"saved_items": user_profiles[email]["saved_items"]})
    
    elif request.method == "POST":
        data = request.get_json()
        item = {
            "id": data.get("id"),
            "type": data.get("type"),
            "title": data.get("title"),
            "href": data.get("href"),
            "image": data.get("image"),
            "saved_at": datetime.now().isoformat()
        }
        
        # Check if item already exists
        existing_items = user_profiles[email]["saved_items"]
        for existing_item in existing_items:
            if existing_item["id"] == item["id"]:
                return jsonify({"detail": "Item already saved"}), 409
        
        user_profiles[email]["saved_items"].append(item)
        return jsonify({"message": "Item saved successfully"})
    
    elif request.method == "DELETE":
        data = request.get_json()
        item_id = data.get("id")
        
        user_profiles[email]["saved_items"] = [
            item for item in user_profiles[email]["saved_items"] 
            if item["id"] != item_id
        ]
        
        return jsonify({"message": "Item removed successfully"})

# Admin endpoints
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not verify_password(email, password):
            return jsonify({"detail": "Invalid email or password"}), 401
        
        # Generate and store token
        token = generate_token()
        tokens[token] = {
            "email": email,
            "created": datetime.now().timestamp(),
            "role": "admin"
        }
        
        return jsonify({"access_token": token, "token_type": "bearer"})
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/admin/me")
def get_admin_info():
    """Get current admin user info"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "email": ADMIN_EMAIL,
        "role": "Administrator",
        "status": "Active"
    })

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    """Admin logout"""
    token = request.args.get("token")
    if token in tokens:
        del tokens[token]
    return jsonify({"message": "Successfully logged out"})

@app.route("/api/admin/stats")
def get_admin_stats():
    """Get admin dashboard statistics"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "total_users": len(users),
        "total_visitors": 1250,
        "total_pages": 15,
        "total_forms": 8,
        "last_login": datetime.now().isoformat(),
        "system_status": "Healthy",
        "uptime": "99.9%"
    })

@app.route("/api/admin/users")
def get_all_users():
    """Get all users (admin only)"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    users_list = []
    for email, user_data in users.items():
        profile_data = user_profiles.get(email, {})
        users_list.append({
            "email": email,
            "name": user_data.get("name", ""),
            "role": user_data.get("role", "user"),
            "status": user_data.get("status", "active"),
            "created_at": user_data.get("created_at"),
            "last_login": profile_data.get("last_login"),
            "saved_items_count": len(profile_data.get("saved_items", []))
        })
    
    return jsonify({"users": users_list})

@app.route("/api/admin/content")
def get_content_list():
    """Get list of manageable content"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "pages": [
            {"id": 1, "title": "Home Page", "slug": "/", "last_updated": "2024-01-15"},
            {"id": 2, "title": "About Page", "slug": "/about", "last_updated": "2024-01-14"},
            {"id": 3, "title": "Services Page", "slug": "/services", "last_updated": "2024-01-13"},
        ],
        "posts": [
            {"id": 1, "title": "Latest Research", "slug": "/research/latest", "last_updated": "2024-01-12"},
            {"id": 2, "title": "Publications", "slug": "/publications", "last_updated": "2024-01-11"},
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
