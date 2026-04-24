#!/usr/bin/env python3
"""
Simple server startup script that handles imports correctly
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Import modules directly without relative imports
try:
    import config
    import security
    import database
    from http.server import ThreadingHTTPServer
    from http import HTTPStatus
    
    print("🚀 Starting admin backend server...")
    print(f"📁 Database path: {backend_dir / 'data' / 'users.db'}")
    
    # Initialize database
    db = database.UserDatabase()
    
    # Create admin user if needed
    existing_user = db.get_user_by_username(config.DEFAULT_ADMIN_USERNAME)
    if not existing_user:
        print("🔧 Creating default admin user...")
        db.create_user(
            username=config.DEFAULT_ADMIN_USERNAME,
            password=config.DEFAULT_ADMIN_PASSWORD,
            display_name=config.DEFAULT_ADMIN_NAME,
            role="super_admin"
        )
        print(f"✅ Admin user '{config.DEFAULT_ADMIN_USERNAME}' created")
    else:
        print(f"✅ Admin user '{config.DEFAULT_ADMIN_USERNAME}' exists")
    
    # Import the server module
    import server
    
    # Start the server using the original main function
    server.main()
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all required files are in the backend directory")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)
