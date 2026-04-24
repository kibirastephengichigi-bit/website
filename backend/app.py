from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import secrets
import json
import hashlib
import re

app = Flask(__name__)
CORS(app, origins=["http://localhost:3001", "http://localhost:3000"])

# Admin credentials (stored in variables for easy updating)
ADMIN_EMAIL = "admin@stephenasatsa.com"
ADMIN_PASSWORD = "ChangeMe123!"

# Simple storage (in production, use database)
tokens = {}
users = {}
user_profiles = {}
admin_credentials_history = []  # Track credential changes
gallery_photos = {}  # Store gallery photos
next_photo_id = 1

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

@app.route("/api/admin/credentials", methods=["GET"])
def get_admin_credentials():
    """Get current admin credentials (without password)"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "email": ADMIN_EMAIL,
        "has_password": bool(ADMIN_PASSWORD),
        "password_length": len(ADMIN_PASSWORD) if ADMIN_PASSWORD else 0,
        "history": admin_credentials_history[-5:] if admin_credentials_history else []
    })

@app.route("/api/admin/credentials", methods=["PUT"])
def update_admin_credentials():
    """Update admin credentials"""
    global ADMIN_EMAIL, ADMIN_PASSWORD
    
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        current_password = data.get("current_password")
        new_email = data.get("email")
        new_password = data.get("password")
        
        # Verify current password
        if not current_password or current_password != ADMIN_PASSWORD:
            return jsonify({"detail": "Current password is incorrect"}), 401
        
        # Validate new email if provided
        if new_email and not is_valid_email(new_email):
            return jsonify({"detail": "Invalid email format"}), 400
        
        # Validate new password if provided
        if new_password and not is_valid_password(new_password):
            return jsonify({"detail": "Password must be at least 8 characters with uppercase, lowercase, and numbers"}), 400
        
        # Store old credentials in history
        admin_credentials_history.append({
            "timestamp": datetime.now().isoformat(),
            "old_email": ADMIN_EMAIL,
            "new_email": new_email or ADMIN_EMAIL,
            "changed_by": token_data["email"]
        })
        
        # Update credentials
        old_email = ADMIN_EMAIL
        
        if new_email:
            ADMIN_EMAIL = new_email
        
        if new_password:
            ADMIN_PASSWORD = new_password
        
        # Update all existing admin tokens to use new email
        for token_key, token_data in tokens.items():
            if token_data.get("role") == "admin" and token_data.get("email") == old_email:
                token_data["email"] = ADMIN_EMAIL
        
        return jsonify({
            "message": "Credentials updated successfully",
            "email": ADMIN_EMAIL,
            "updated_at": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/admin/credentials/validate", methods=["POST"])
def validate_current_password():
    """Validate current admin password"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        password = data.get("password")
        
        if password == ADMIN_PASSWORD:
            return jsonify({"valid": True})
        else:
            return jsonify({"valid": False})
            
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

# Gallery Management Endpoints
@app.route("/api/gallery/photos", methods=["GET"])
def get_gallery_photos():
    """Get all gallery photos"""
    try:
        photos_list = []
        for photo_id, photo_data in gallery_photos.items():
            photos_list.append({
                "id": photo_id,
                "title": photo_data["title"],
                "description": photo_data["description"],
                "image_url": photo_data["image_url"],
                "thumbnail_url": photo_data["thumbnail_url"],
                "upload_date": photo_data["upload_date"],
                "file_size": photo_data["file_size"],
                "dimensions": photo_data["dimensions"],
                "category": photo_data.get("category"),
                "tags": photo_data.get("tags", [])
            })
        
        # Sort by upload date (newest first)
        photos_list.sort(key=lambda x: x["upload_date"], reverse=True)
        
        return jsonify({
            "photos": photos_list,
            "total": len(photos_list)
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch photos"}), 500

@app.route("/api/admin/gallery/photos", methods=["POST"])
def upload_gallery_photo():
    """Upload a new photo to the gallery"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"detail": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"detail": "No file selected"}), 400
        
        # Get form data
        title = request.form.get('title', 'Untitled Photo')
        description = request.form.get('description', '')
        category = request.form.get('category', '')
        tags = request.form.get('tags', '').split(',') if request.form.get('tags') else []
        
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({"detail": "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"}), 400
        
        # Create uploads directory if it doesn't exist
        import os
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'gallery')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        global next_photo_id
        photo_id = str(next_photo_id)
        next_photo_id += 1
        
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"photo_{photo_id}_{int(datetime.now().timestamp())}.{file_extension}"
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        
        # For now, we'll use a placeholder for dimensions (in production, use PIL)
        dimensions = {"width": 1920, "height": 1080}  # Default dimensions
        
        # Create URLs (in production, these would be actual URLs)
        image_url = f"http://localhost:8000/uploads/gallery/{filename}"
        thumbnail_url = f"http://localhost:8000/uploads/gallery/{filename}"  # Same for now
        
        # Store photo data
        gallery_photos[photo_id] = {
            "title": title,
            "description": description,
            "image_url": image_url,
            "thumbnail_url": thumbnail_url,
            "upload_date": datetime.now().isoformat(),
            "file_size": file_size,
            "dimensions": dimensions,
            "category": category,
            "tags": [tag.strip() for tag in tags if tag.strip()],
            "filename": filename,
            "uploaded_by": token_data["email"]
        }
        
        return jsonify({
            "message": "Photo uploaded successfully",
            "photo": {
                "id": photo_id,
                "title": title,
                "description": description,
                "image_url": image_url,
                "thumbnail_url": thumbnail_url,
                "upload_date": gallery_photos[photo_id]["upload_date"],
                "file_size": file_size,
                "dimensions": dimensions,
                "category": category,
                "tags": gallery_photos[photo_id]["tags"]
            }
        }), 201
        
    except Exception as e:
        return jsonify({"detail": f"Upload failed: {str(e)}"}), 500

@app.route("/api/admin/gallery/photos/<photo_id>", methods=["PUT"])
def update_gallery_photo(photo_id):
    """Update photo details"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if photo_id not in gallery_photos:
            return jsonify({"detail": "Photo not found"}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if "title" in data:
            gallery_photos[photo_id]["title"] = data["title"]
        if "description" in data:
            gallery_photos[photo_id]["description"] = data["description"]
        if "category" in data:
            gallery_photos[photo_id]["category"] = data["category"]
        if "tags" in data:
            gallery_photos[photo_id]["tags"] = data["tags"]
        
        return jsonify({
            "message": "Photo updated successfully",
            "photo": gallery_photos[photo_id]
        })
        
    except Exception as e:
        return jsonify({"detail": "Update failed"}), 500

@app.route("/api/admin/gallery/photos/<photo_id>", methods=["DELETE"])
def delete_gallery_photo(photo_id):
    """Delete a photo from the gallery"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if photo_id not in gallery_photos:
            return jsonify({"detail": "Photo not found"}), 404
        
        # Delete file from filesystem
        import os
        photo_data = gallery_photos[photo_id]
        if "filename" in photo_data:
            file_path = os.path.join(os.getcwd(), 'uploads', 'gallery', photo_data["filename"])
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Remove from storage
        del gallery_photos[photo_id]
        
        return jsonify({"message": "Photo deleted successfully"})
        
    except Exception as e:
        return jsonify({"detail": "Deletion failed"}), 500

@app.route("/api/admin/gallery/photos", methods=["GET"])
def get_admin_gallery_photos():
    """Get all gallery photos for admin management"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        photos_list = []
        for photo_id, photo_data in gallery_photos.items():
            photos_list.append({
                "id": photo_id,
                "title": photo_data["title"],
                "description": photo_data["description"],
                "image_url": photo_data["image_url"],
                "thumbnail_url": photo_data["thumbnail_url"],
                "upload_date": photo_data["upload_date"],
                "file_size": photo_data["file_size"],
                "dimensions": photo_data["dimensions"],
                "category": photo_data.get("category"),
                "tags": photo_data.get("tags", []),
                "uploaded_by": photo_data.get("uploaded_by"),
                "filename": photo_data.get("filename")
            })
        
        # Sort by upload date (newest first)
        photos_list.sort(key=lambda x: x["upload_date"], reverse=True)
        
        return jsonify({
            "photos": photos_list,
            "total": len(photos_list)
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch photos"}), 500

# Serve uploaded files
@app.route("/uploads/gallery/<filename>")
def serve_gallery_file(filename):
    """Serve uploaded gallery files"""
    try:
        import os
        from flask import send_from_directory
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'gallery')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({"detail": "File not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
