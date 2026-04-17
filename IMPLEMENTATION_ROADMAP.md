# Hybrid Next.js + FastAPI Implementation Roadmap

## Quick Reference

| Component | Status | Priority | Est. Time |
|-----------|--------|----------|-----------|
| Architecture Design | ✅ DONE | P0 | — |
| Backend Project Setup | 🔲 TODO | P0 | 1h |
| Database Models (SQLModel) | 🔲 TODO | P0 | 1.5h |
| Auth Routes & Middleware | 🔲 TODO | P1 | 2h |
| Blog/Media/Testimonials CRUD | 🔲 TODO | P1 | 3h |
| Dynamic Page System (Core Feature) | 🔲 TODO | P1 | 3h |
| Next.js Proxy Routes | 🔲 TODO | P2 | 1h |
| Admin Dashboard Redesign | 🔲 TODO | P2 | 4h |
| Page Editor UI Component | 🔲 TODO | P2 | 3h |
| ISR Integration | 🔲 TODO | P3 | 1.5h |
| Docker Setup | 🔲 TODO | P3 | 1h |
| Testing & Documentation | 🔲 TODO | P3 | 2h |
| **TOTAL** | — | — | **~27 hours** |

---

## Phase 1: Backend Setup (Core Foundation)

### 1.1 Project Structure & Dependencies

```bash
# Create backend project structure
mkdir -p backend/app/{api,models,schemas,services,utils,dependencies,middleware}
mkdir -p backend/migrations/versions

# Create key files
touch backend/requirements.txt
touch backend/.env.example
touch backend/main.py
touch backend/pyproject.toml
touch backend/.dockerignore
```

### 1.2 Requirements (Python Dependencies)

**File**: `backend/requirements.txt`

```
# Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlmodel==0.0.14
sqlalchemy==2.0.23
alembic==1.13.1
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
psycopg2-binary==2.9.9
python-dotenv==1.0.0

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
PyJWT==2.8.1
bcrypt==4.1.1

# File upload & Media
python-multipart==0.0.6
cloudinary==1.36.0

# Utilities
httpx==0.25.2
email-validator==2.1.0
python-dateutil==2.8.2

# Development
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.11.0
flake8==6.1.0

# Documentation
fastapi-openapi-generator==1.0.0
```

### 1.3 Environment Template

**File**: `backend/.env.example`

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stephenasatsa_v2
DB_ECHO=false

# JWT & Security
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Next.js Integration
NEXTJS_REVALIDATE_SECRET=your-nextjs-revalidate-secret
NEXTJS_URL=http://localhost:3000

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Admin
ADMIN_EMAIL=admin@stephenasatsa.com
ADMIN_PASSWORD=ChangeMe123!
MAX_UPLOAD_SIZE_MB=50

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### 1.4 Config Module

**File**: `backend/app/config.py`

```python
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Database
    DATABASE_URL: str
    DB_ECHO: bool = False
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Next.js Integration
    NEXTJS_REVALIDATE_SECRET: str = ""
    NEXTJS_URL: str = "http://localhost:3000"
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Upload
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_UPLOAD_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
    ]
    
    # Admin
    ADMIN_EMAIL: str
    
    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Load settings
settings = Settings()
```

### 1.5 Database Connection

**File**: `backend/app/database.py`

```python
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
from typing import Generator

from app.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,   # Recycle connections every hour
)


def create_db_and_tables():
    """Create all tables (call on app startup)"""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency for getting database session"""
    with Session(engine) as session:
        yield session
```

### 1.6 Main FastAPI Application

**File**: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import create_db_and_tables
from app.api.auth import router as auth_router
from app.api.blog import router as blog_router
from app.api.pages import router as pages_router
from app.api.media import router as media_router
from app.api.testimonials import router as testimonials_router
from app.api.research import router as research_router
from app.api.publications import router as publications_router
from app.api.settings import router as settings_router
from app.middleware.error_handler import setup_error_handlers


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown"""
    # Startup
    logger.info("Creating database tables...")
    create_db_and_tables()
    logger.info("Application started ✓")
    
    yield
    
    # Shutdown
    logger.info("Application shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Dr. Stephen Asatsa Website API",
    description="Professional content management API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Setup error handlers
setup_error_handlers(app)


# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(blog_router, prefix="/api/blog", tags=["blog"])
app.include_router(pages_router, prefix="/api/pages", tags=["pages"])
app.include_router(media_router, prefix="/api/media", tags=["media"])
app.include_router(testimonials_router, prefix="/api/testimonials", tags=["testimonials"])
app.include_router(research_router, prefix="/api/research", tags=["research"])
app.include_router(publications_router, prefix="/api/publications", tags=["publications"])
app.include_router(settings_router, prefix="/api/settings", tags=["settings"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/")
async def root():
    """API info"""
    return {
        "app": "Dr. Stephen Asatsa Website API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower(),
    )
```

---

## Phase 2: Data Models

### 2.1 User Model

**File**: `backend/app/models/user.py`

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"


class User(SQLModel, table=True):
    """Administrator user model"""
    __tablename__ = "users"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    password_hash: str
    
    role: UserRole = UserRole.EDITOR
    is_active: bool = True
    
    # 2FA
    totp_secret: Optional[str] = None
    totp_enabled: bool = False
    
    # Tracking
    last_login_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    blog_posts: List["BlogPost"] = Relationship(back_populates="author")
    audit_logs: List["AuditLog"] = Relationship(back_populates="actor")
```

### 2.2 Page Models (Core Feature)

**File**: `backend/app/models/page.py`

```python
from sqlmodel import SQLModel, Field, Relationship, JSON
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import uuid4


class PageStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class BlockType(str, Enum):
    HERO = "hero"
    TEXT = "text"
    IMAGE = "image"
    SERVICES = "services"
    TESTIMONIALS = "testimonials"
    RESEARCH = "research"
    CTA = "cta"
    GALLERY = "gallery"
    FORM = "form"
    STATS = "stats"
    DIVIDER = "divider"


class PageBlock(SQLModel, table=True):
    """Single block/component within a page"""
    __tablename__ = "page_blocks"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    page_id: str = Field(foreign_key="pages.id", index=True)
    
    type: BlockType
    position: int = Field(index=True)
    
    data: Dict[str, Any] = Field(default={}, sa_type=JSON)
    settings: Dict[str, Any] = Field(default={}, sa_type=JSON)
    
    is_visible: bool = True
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    page: Optional["Page"] = Relationship(back_populates="blocks")


class Page(SQLModel, table=True):
    """Dynamic editable page"""
    __tablename__ = "pages"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    
    slug: str = Field(unique=True, index=True)
    title: str
    description: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    
    status: PageStatus = PageStatus.DRAFT
    published_at: Optional[datetime] = None
    
    created_by: Optional[str] = Field(default=None, foreign_key="users.id")
    updated_by: Optional[str] = Field(default=None, foreign_key="users.id")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    blocks: List[PageBlock] = Relationship(back_populates="page", cascade_delete=True)
```

### 2.3 Other Models

**File**: `backend/app/models/__init__.py`

```python
from .user import User, UserRole
from .page import Page, PageBlock, PageStatus, BlockType
from .blog import BlogPost
from .media import Media
from .testimonial import Testimonial
from .research import ResearchProject
from .publication import Publication
from .audit import AuditLog
from .settings import SiteSettings

__all__ = [
    "User",
    "UserRole",
    "Page",
    "PageBlock",
    "PageStatus",
    "BlockType",
    "BlogPost",
    "Media",
    "Testimonial",
    "ResearchProject",
    "Publication",
    "AuditLog",
    "SiteSettings",
]
```

Create individual files for other models (blog.py, media.py, etc.) following the same pattern.

---

## Phase 3: Authentication Routes

### 3.1 JWT Utils

**File**: `backend/app/utils/jwt.py`

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

from app.config import settings


def create_access_token(user_id: str, role: str) -> str:
    """Create JWT access token"""
    expires = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    
    data = {
        "sub": user_id,
        "role": role,
        "exp": expires,
        "iat": datetime.utcnow(),
    }
    
    return jwt.encode(
        data,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token"""
    expires = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    data = {
        "sub": user_id,
        "type": "refresh",
        "exp": expires,
        "iat": datetime.utcnow(),
    }
    
    return jwt.encode(
        data,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode token"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Optional[str]:
    """Verify access token and return user_id"""
    payload = verify_token(token)
    if not payload or payload.get("type") == "refresh":
        return None
    return payload.get("sub")
```

### 3.2 Auth Schemas (Pydantic)

**File**: `backend/app/schemas/auth.py`

```python
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.models import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    role: UserRole
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserResponse
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str
```

### 3.3 Auth Routes

**File**: `backend/app/api/auth/router.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from app.database import get_session
from app.models import User, UserRole
from app.schemas.auth import LoginRequest, AuthResponse, TokenResponse, RefreshTokenRequest
from app.utils.jwt import create_access_token, create_refresh_token, verify_token
from app.utils.security import verify_password, hash_password
from app.utils.audit import log_audit
from app.dependencies.auth import get_current_admin_user


router = APIRouter()


@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_session),
):
    """Authenticate user and return tokens"""
    
    # Find user
    user = db.exec(
        select(User).where(User.email == credentials.email)
    ).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    
    # Generate tokens
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.add(user)
    db.commit()
    
    # Log audit event
    await log_audit(
        db,
        action="auth.login",
        actor_id=user.id,
        summary=f"User '{user.email}' logged in",
    )
    
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: RefreshTokenRequest,
    db: Session = Depends(get_session),
):
    """Refresh access token"""
    
    payload = verify_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    user_id = payload.get("sub")
    user = db.get(User, user_id)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    access_token = create_access_token(user.id, user.role)
    
    return TokenResponse(access_token=access_token)


@router.get("/me")
async def get_current_user(
    current_user: User = Depends(get_current_admin_user),
):
    """Get current authenticated user"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
    }
```

### 3.4 Auth Dependencies

**File**: `backend/app/dependencies/auth.py`

```python
from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import User, UserRole
from app.utils.jwt import verify_access_token
from fastapi.security import HTTPBearer, HTTPAuthCredentials


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_session),
) -> User:
    """Get current authenticated user from JWT token"""
    
    token = credentials.credentials
    user_id = verify_access_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require admin role"""
    
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    return current_user
```

---

## What's Next?

This document covers **Phases 1-3** of implementation. Would you like me to continue with:

### Option A - Continue Full Backend
- ✅ Models & database setup
- ✅ Auth system
- ⏳ Blog/Media/Testimonials CRUD
- ⏳ Dynamic Pages API
- ⏳ Cloudinary integration

### Option B - Jump to Admin Dashboard
- ✅ FastAPI foundation ready
- ⏳ Redesign admin layout
- ⏳ Page editor UI
- ⏳ API integration

### Option C - Create Complete Code Templates
All routers, services, and helpers ready to customize

### Option D - Docker & Deployment
Setup docker-compose, migrations, production config

Which would you prefer to tackle next?

---

**Last Updated**: 2026-04-17  
**Next Review**: After Phase 1 completion
