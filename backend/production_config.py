"""
Production configuration for Stephen Asatsa Website Backend
"""
import os

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DEBUG = False
    TESTING = False
    
    # Database configuration (if needed in future)
    # DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Logging configuration
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'logs/app.log'
    
    # Security settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
