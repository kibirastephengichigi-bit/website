#!/usr/bin/env python3
"""
Database migration script for the admin backend.
Creates the database and initializes the default admin user.
"""

import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from database import db
import config


def create_default_admin():
    """Create the default admin user if it doesn't exist"""
    try:
        # Check if admin user already exists
        existing_user = db.get_user_by_username(config.DEFAULT_ADMIN_USERNAME)
        if existing_user:
            print(f"✅ Admin user '{config.DEFAULT_ADMIN_USERNAME}' already exists")
            return existing_user
        
        # Create default admin user
        print(f"🔧 Creating default admin user '{config.DEFAULT_ADMIN_USERNAME}'...")
        admin_user = db.create_user(
            username=config.DEFAULT_ADMIN_USERNAME,
            password=config.DEFAULT_ADMIN_PASSWORD,
            display_name=config.DEFAULT_ADMIN_NAME,
            role="super_admin"
        )
        
        print(f"✅ Admin user created successfully:")
        print(f"   Username: {admin_user['username']}")
        print(f"   Display Name: {admin_user['display_name']}")
        print(f"   Role: {admin_user['role']}")
        print(f"   Created: {admin_user['created_at']}")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None


def migrate_storage_to_database():
    """Migrate existing JSON storage data to database"""
    import json
    from pathlib import Path
    
    print("🔄 Checking for existing JSON storage data...")
    
    # Migrate admin users
    admin_users_file = config.ADMIN_USERS_FILE
    if admin_users_file.exists():
        try:
            with open(admin_users_file, 'r') as f:
                admin_users = json.load(f)
            
            for user_data in admin_users:
                username = user_data.get('username')
                if username and username != config.DEFAULT_ADMIN_USERNAME:
                    # Check if user already exists in database
                    existing = db.get_user_by_username(username)
                    if not existing:
                        print(f"🔄 Migrating user: {username}")
                        db.create_user(
                            username=username,
                            password="migration-required",  # Will need password reset
                            display_name=user_data.get('displayName', username),
                            role=user_data.get('role', 'user')
                        )
            
            print("✅ User migration completed")
            
        except Exception as e:
            print(f"⚠️  Error migrating users: {e}")
    
    # Migrate audit events
    audit_log_file = config.AUDIT_LOG_FILE
    if audit_log_file.exists():
        try:
            with open(audit_log_file, 'r') as f:
                audit_events = json.load(f)
            
            for event in audit_events:
                # Get user ID for the event
                actor = event.get('actor')
                user = db.get_user_by_username(actor) if actor else None
                
                db.append_audit_event(
                    action=event.get('action', 'unknown'),
                    actor=event.get('actor', 'unknown'),
                    summary=event.get('summary', ''),
                    metadata=event.get('metadata'),
                    user_id=user['id'] if user else None,
                    ip_address=event.get('ipAddress')
                )
            
            print("✅ Audit log migration completed")
            
        except Exception as e:
            print(f"⚠️  Error migrating audit log: {e}")


def main():
    """Main migration function"""
    print("🚀 Starting database migration...")
    
    # Initialize database (automatically done by UserDatabase constructor)
    print("✅ Database initialized")
    
    # Create default admin user
    create_default_admin()
    
    # Migrate existing data if available
    migrate_storage_to_database()
    
    # Clean up expired sessions
    cleaned_count = db.cleanup_expired_sessions()
    if cleaned_count > 0:
        print(f"🧹 Cleaned up {cleaned_count} expired sessions")
    
    print("✅ Migration completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the backend server: python -m backend")
    print("2. Test login with:")
    print(f"   Username: {config.DEFAULT_ADMIN_USERNAME}")
    print(f"   Password: {config.DEFAULT_ADMIN_PASSWORD}")
    print("3. Change the default password after first login")


if __name__ == "__main__":
    main()
