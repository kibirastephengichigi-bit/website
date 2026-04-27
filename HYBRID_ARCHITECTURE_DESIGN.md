# Hybrid Next.js + FastAPI Architecture for Dr. Stephen Asatsa Website

## Executive Summary

This document outlines a complete architecture migration from a Next.js-only admin backend to a professional hybrid stack:
- **Frontend**: Next.js 15 (public site + admin dashboard)
- **Backend**: FastAPI (Python) - handles all content, admin CRUD, media, and page editing
- **Database**: PostgreSQL (shared via Prisma + SQLModel)
- **Auth**: NextAuth.js (NextJS) ↔ JWT (FastAPI) integration

### Key Benefits
✅ Separation of concerns (frontend vs backend)  
✅ Language-specific optimizations (TypeScript for UI, Python for business logic)  
✅ Scalable microservices foundation  
✅ Dynamic page content editing system  
✅ Professional admin dashboard with modern UX  
✅ Docker-ready deployment  

---

## 1. Project Structure

```
website/
├── frontend/                          # Next.js app (move from root)
│   ├── app/
│   │   ├── (public)/                  # Public pages
│   │   ├── admin/                     # Admin dashboard (protected routes)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── blog/
│   │   │   ├── pages/                 # Dynamic page editor (NEW)
│   │   │   ├── pages/[slug]/
│   │   │   ├── media/
│   │   │   ├── settings/
│   │   │   └── ...
│   │   └── api/
│   │       └── admin/                 # Proxy routes to FastAPI
│   │           ├── blog/route.ts
│   │           ├── pages/route.ts
│   │           └── ...
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-layout.tsx
│   │   │   ├── sidebar-nav.tsx
│   │   │   ├── page-editor.tsx        # NEW - visual block editor
│   │   │   └── ...
│   │   └── ...
│   ├── hooks/
│   │   ├── useAdminApi.ts             # SWR/React Query for FastAPI
│   │   ├── usePageEditor.ts
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts                     # FastAPI client
│   │   └── ...
│   ├── types/
│   │   ├── admin.ts                   # Admin types from FastAPI
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── backend/                           # NEW - FastAPI application
│   ├── README.md
│   ├── main.py                        # FastAPI entry point
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example
│   ├── docker/
│   │   └── Dockerfile
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app creation
│   │   ├── config.py                  # Settings via Pydantic
│   │   ├── database.py                # SQLModel session
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth/                  # Auth routes (JWT, login, refresh)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── blog/                  # Blog CRUD
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py         # Pydantic models
│   │   │   │   ├── models.py          # SQLModel ORM
│   │   │   │   ├── repository.py      # Database access
│   │   │   │   └── service.py         # Business logic
│   │   │   │
│   │   │   ├── pages/                 # Dynamic pages (NEW CRITICAL FEATURE)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py         # Page, PageSection, PageBlock
│   │   │   │   ├── models.py
│   │   │   │   ├── repository.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── media/                 # Media upload/management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── cloudinary.py      # Cloudinary integration
│   │   │   │
│   │   │   ├── testimonials/
│   │   │   ├── research/
│   │   │   ├── publications/
│   │   │   │
│   │   │   └── settings/              # Global settings
│   │   │       ├── __init__.py
│   │   │       ├── router.py
│   │   │       ├── schemas.py
│   │   │       └── service.py
│   │   │
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # JWT verification
│   │   │   ├── cors.py                # CORS config
│   │   │   └── error_handler.py       # Global error handling
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # User model
│   │   │   ├── blog.py
│   │   │   ├── page.py                # Dynamic page models
│   │   │   ├── media.py
│   │   │   ├── testimonial.py
│   │   │   ├── research.py
│   │   │   └── publication.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── blog.py
│   │   │   ├── page.py                # Page request/response schemas
│   │   │   ├── media.py
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── ...
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py                 # JWT token creation/verification
│   │   │   ├── security.py            # Password hashing, validation
│   │   │   └── pagination.py
│   │   │
│   │   ├── dependencies/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # get_current_admin_user dependency
│   │   │   └── db.py
│   │   │
│   │   └── exceptions/
│   │       ├── __init__.py
│   │       └── custom.py
│   │
│   └── migrations/                    # Alembic migrations for SQLModel
│       ├── alembic.ini
│       ├── env.py
│       └── versions/
│
├── docker-compose.yml                 # Development: FastAPI + Postgres + Next.js
├── .env.example
├── prisma/                            # (OPTIONAL - can deprecate)
│   └── schema.prisma
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API_SPEC.md
    ├── MIGRATION_GUIDE.md
    └── SETUP_INSTRUCTIONS.md
```

---

## 2. Technology Stack

| Layer | Tech | Version | Purpose |
|-------|------|---------|---------|
| **Frontend** | Next.js | 15 | Public site + Admin UI |
| **Frontend** | React | 19 | Component framework |
| **Frontend** | TypeScript | 5.7 | Type safety |
| **Frontend** | TailwindCSS | 3.4 | Styling |
| **Frontend** | Framer Motion | 12.7 | Animations |
| **Frontend** | NextAuth.js | 5.0 | Session management |
| **Frontend** | React Query/SWR | ^7.0 | Data fetching |
| **Frontend** | Zod | 3.24 | Validation |
| **Backend** | FastAPI | 0.104+ | REST API framework |
| **Backend** | SQLModel | 0.0.14 | ORM (Pydantic + SQLAlchemy) |
| **Database** | PostgreSQL | 14+ | Primary datastore |
| **Database** | Alembic | 1.13 | Schema migrations |
| **Auth** | JWT | Native | Token-based auth |
| **DevOps** | Docker | Latest | Containerization |
| **DevOps** | Docker Compose | Latest | Local development |

---

## 3. Authentication Flow (NextAuth.js ↔ FastAPI)

### Current: NextAuth.js Session-Based
- User logs in via `/api/auth/signin`
- Session stored in PostgreSQL (via Prisma)
- All calls to Next.js routes are authenticated

### New: Hybrid Approach (RECOMMENDED)

1. **NextAuth.js** handles:
   - Initial login UI (`/signin`)
   - Session management for Next.js frontend
   - Cookie-based authentication
   - OAuth integration (Google)

2. **FastAPI** handles:
   - User credentials verification against PostgreSQL
   - JWT token generation & refresh
   - Role-based access control (RBAC)
   - Audit logging

### Flow Diagram
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Login with credentials
       ▼
┌─────────────────────────────────┐
│      Next.js /signin            │
│     (NextAuth.js UI)            │
└────────┬────────────────────────┘
         │ 2. POST /api/auth/login (to FastAPI)
         ▼
┌─────────────────────────────────┐
│    FastAPI /auth/login          │
│  - Verify credentials           │
│  - Check roles                  │
│  - Generate JWT tokens          │
└────────┬────────────────────────┘
         │ 3. Return {access_token, refresh_token}
         ▼
┌─────────────────────────────────┐
│   Next.js API Route             │
│   (Proxy to FastAPI)            │
│  - Store tokens in session      │
│  - Forward to FastAPI           │
└────────┬────────────────────────┘
         │ 4. Redirect to /admin
         ▼
┌─────────────────────────────────┐
│    Admin Dashboard              │
│  - All API calls include JWT    │
│  - Validated by FastAPI         │
└─────────────────────────────────┘
```

### Implementation Details

**NextAuth.js Config** (`frontend/lib/auth.ts`):
```typescript
const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Call FastAPI /auth/login
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials?.email,
            password: credentials?.password,
          }),
        });
        
        const data = await res.json();
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
```

**FastAPI Auth Route** (`backend/app/api/auth/router.py`):
```python
@router.post("/login")
async def login(
    credentials: LoginSchema,
    db: Session = Depends(get_db),
):
    # Verify user credentials
    user = db.query(User).filter(User.email == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate tokens
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)
    
    # Log audit event
    await log_audit("user.login", user.id, f"User '{user.email}' logged in")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": UserSchema.model_validate(user),
    }
```

---

## 4. Dynamic Page Content System (CRITICAL FEATURE)

### Problem Statement
Currently, page content is hardcoded in React components. The admin wants to edit ANY page's content through a visual editor without touching code.

### Solution: Block-Based Page System

#### Data Model

```python
# backend/app/models/page.py

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


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
    CTA = "cta"
    GALLERY = "gallery"
    FORM = "form"
    STATS = "stats"
    RESEARCH = "research"


class PageBlock(SQLModel, table=True):
    """Represents a single block within a page (hero, text, image, etc.)"""
    __tablename__ = "page_blocks"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    page_id: str = Field(foreign_key="pages.id")
    
    type: BlockType  # hero, text, image, services, etc.
    position: int    # Order within page (0, 1, 2, ...)
    
    # Flexible JSON structure for block content
    data: dict       # {title, subtitle, image, alignment, etc.}
    settings: dict   # {backgroundColor, padding, hide_on_mobile, etc.}
    
    is_visible: bool = True
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    page: Optional["Page"] = Relationship(back_populates="blocks")


class Page(SQLModel, table=True):
    """Represents a dynamic page that can be edited in admin"""
    __tablename__ = "pages"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    
    slug: str = Field(unique=True, index=True)  # home, about, services, etc.
    title: str
    description: Optional[str] = Field(None)
    
    seo_title: Optional[str]
    seo_description: Optional[str]
    seo_keywords: Optional[str]
    
    status: PageStatus = PageStatus.DRAFT
    published_at: Optional[datetime] = None
    
    # Track author/editor
    created_by: Optional[str] = Field(default=None, foreign_key="user.id")
    updated_by: Optional[str] = Field(default=None, foreign_key="user.id")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    blocks: List[PageBlock] = Relationship(back_populates="page", cascade_delete=True)
```

#### API Endpoints

```python
# backend/app/api/pages/router.py

@router.get("/pages")
async def list_pages(
    status: Optional[PageStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """List all pages"""
    query = db.query(Page)
    if status:
        query = query.filter(Page.status == status)
    return query.all()


@router.get("/pages/{slug}")
async def get_page(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get page (public - no auth required)"""
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page or page.status != PageStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.post("/pages")
async def create_page(
    page_data: PageCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create new page"""
    existing = db.query(Page).filter(Page.slug == page_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    page = Page(
        slug=page_data.slug,
        title=page_data.title,
        description=page_data.description,
        created_by=current_user.id,
        updated_by=current_user.id,
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    
    await log_audit("page.created", current_user.id, f"Created page: {page.slug}")
    return page


@router.put("/pages/{page_id}")
async def update_page(
    page_id: str,
    page_data: PageUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update page metadata"""
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    page.title = page_data.title
    page.description = page_data.description
    page.seo_title = page_data.seo_title
    page.seo_description = page_data.seo_description
    page.updated_by = current_user.id
    
    db.add(page)
    db.commit()
    db.refresh(page)
    
    await log_audit("page.updated", current_user.id, f"Updated page: {page.slug}")
    return page


@router.post("/pages/{page_id}/blocks")
async def add_block(
    page_id: str,
    block_data: PageBlockCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add a block to a page"""
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Calculate next position
    max_position = db.query(func.max(PageBlock.position)).filter(PageBlock.page_id == page_id).scalar() or -1
    
    block = PageBlock(
        page_id=page_id,
        type=block_data.type,
        position=max_position + 1,
        data=block_data.data,
        settings=block_data.settings or {},
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    
    await log_audit("block.added", current_user.id, f"Added {block.type} block to page: {page.slug}")
    return block


@router.put("/pages/{page_id}/blocks/{block_id}")
async def update_block(
    page_id: str,
    block_id: str,
    block_data: PageBlockUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a block"""
    block = db.query(PageBlock).filter(
        PageBlock.id == block_id,
        PageBlock.page_id == page_id
    ).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    
    block.data = block_data.data
    block.settings = block_data.settings
    block.is_visible = block_data.is_visible
    
    db.add(block)
    db.commit()
    db.refresh(block)
    
    return block


@router.delete("/pages/{page_id}/blocks/{block_id}")
async def delete_block(
    page_id: str,
    block_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a block"""
    block = db.query(PageBlock).filter(
        PageBlock.id == block_id,
        PageBlock.page_id == page_id
    ).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    
    db.delete(block)
    db.commit()
    
    await log_audit("block.deleted", current_user.id, f"Deleted {block.type} block from page: {page_id}")
    return {"status": "deleted"}


@router.post("/pages/{page_id}/publish")
async def publish_page(
    page_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Publish a page"""
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Check if has at least one visible block
    visible_blocks = db.query(PageBlock).filter(
        PageBlock.page_id == page_id,
        PageBlock.is_visible == True
    ).count()
    if visible_blocks == 0:
        raise HTTPException(status_code=400, detail="Page must have at least one visible block")
    
    page.status = PageStatus.PUBLISHED
    page.published_at = datetime.utcnow()
    page.updated_by = current_user.id
    
    db.add(page)
    db.commit()
    
    # Trigger ISR revalidation in Next.js
    revalidate_page_in_nextjs(page.slug)
    await log_audit("page.published", current_user.id, f"Published page: {page.slug}")
    
    return page
```

#### Frontend Component: Visual Page Editor

```typescript
// frontend/components/admin/page-editor.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Page, PageBlock, BlockType } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlockEditor } from "@/components/admin/block-editor";
import { PagePreview } from "@/components/admin/page-preview";

export function PageEditor({ pageId }: { pageId: string }) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch page data
  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ["page", pageId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/pages/${pageId}`);
      return res.json();
    },
  });

  // Add block mutation
  const addBlockMutation = useMutation({
    mutationFn: async (blockType: BlockType) => {
      const res = await fetch(`/api/admin/pages/${pageId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: blockType,
          data: getDefaultBlockData(blockType),
          settings: {},
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      // Refetch page to update blocks list
    },
  });

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: async (block: PageBlock) => {
      const res = await fetch(`/api/admin/pages/${pageId}/blocks/${block.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(block),
      });
      return res.json();
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      await fetch(`/api/admin/pages/${pageId}/blocks/${blockId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      setSelectedBlockId(null);
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!page) return <div>Page not found</div>;

  return (
    <div className="grid grid-cols-4 gap-6 h-screen">
      {/* Left Sidebar - Block List */}
      <div className="border-r p-4 overflow-y-auto">
        <h3 className="font-bold mb-4">Page Blocks</h3>
        <div className="space-y-3 mb-6">
          {page.blocks.map((block) => (
            <card
              key={block.id}
              onClick={() => setSelectedBlockId(block.id)}
              className={`p-3 cursor-pointer rounded border ${
                selectedBlockId === block.id ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <div className="font-medium text-sm uppercase">{block.type}</div>
              <div className="text-xs text-gray-600">{block.data.title || "Untitled"}</div>
            </card>
          ))}
        </div>

        {/* Add Block Controls */}
        <div className="space-y-2">
          <p className="text-xs font-bold">Add Block</p>
          {Object.values(BlockType).map((type) => (
            <Button
              key={type}
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => addBlockMutation.mutate(type)}
            >
              + {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Center - Block Editor */}
      <div className="col-span-2 p-6 overflow-y-auto border-r">
        {selectedBlockId && (
          <BlockEditor
            block={page.blocks.find((b) => b.id === selectedBlockId)!}
            onUpdate={(updatedBlock) => updateBlockMutation.mutate(updatedBlock)}
            onDelete={() => deleteBlockMutation.mutate(selectedBlockId)}
          />
        )}
      </div>

      {/* Right - Live Preview */}
      <div className="p-6 overflow-y-auto">
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Editing" : "Preview"}
          </Button>
        </div>

        <PagePreview page={page} />
      </div>
    </div>
  );
}
```

#### Frontend: Block Renderer

```typescript
// frontend/components/blocks/block-renderer.tsx

import { PageBlock } from "@/types/admin";
import { HeroBlockRenderer } from "./hero";
import { TextBlockRenderer } from "./text";
import { ImageBlockRenderer } from "./image";
import { ServicesBlockRenderer } from "./services";
// ... etc

export function BlockRenderer({ block }: { block: PageBlock }) {
  if (!block.is_visible) return null;

  const props = { block, settings: block.settings };

  switch (block.type) {
    case "hero":
      return <HeroBlockRenderer {...props} />;
    case "text":
      return <TextBlockRenderer {...props} />;
    case "image":
      return <ImageBlockRenderer {...props} />;
    case "services":
      return <ServicesBlockRenderer {...props} />;
    // ... other block types
    default:
      return null;
  }
}
```

---

## 5. ISR Integration (Next.js ←→ FastAPI)

When admin publishes/updates content, FastAPI triggers Next.js ISR revalidation.

### FastAPI Side
```python
# backend/app/utils/nextjs.py

import httpx
import os

NEXTJS_REVALIDATE_SECRET = os.environ.get("NEXTJS_REVALIDATE_SECRET", "")
NEXTJS_URL = os.environ.get("NEXTJS_URL", "http://localhost:3000")

async def revalidate_page(slug: str):
    """Trigger Next.js ISR for a specific page"""
    if not NEXTJS_REVALIDATE_SECRET:
        return
    
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{NEXTJS_URL}/api/revalidate",
            params={"secret": NEXTJS_REVALIDATE_SECRET, "slug": slug},
        )


async def revalidate_blog():
    """Trigger ISR for blog index"""
    if not NEXTJS_REVALIDATE_SECRET:
        return
    
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{NEXTJS_URL}/api/revalidate",
            params={"secret": NEXTJS_REVALIDATE_SECRET, "slug": "blog"},
        )
```

### Next.js Side
```typescript
// frontend/app/api/revalidate/route.ts

import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.NEXTJS_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    // Revalidate the specific page
    revalidatePath(`/${slug}`);
    revalidateTag(`page-${slug}`);
    
    return NextResponse.json({ revalidated: true, slug });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
```

---

## 6. Security Considerations

✅ **JWT Token Security**
- Short-lived access tokens (15 min)
- Refresh tokens stored securely
- Token signing with strong secret

✅ **CORS & CSRF**
- Restrict FastAPI CORS to Next.js origin
- CSRF tokens for state-changing operations
- SameSite cookie attributes

✅ **Rate Limiting**
- API rate limits (100 req/min per IP)
- Login attempt throttling
- Upload size limits

✅ **Audit Logging**
- Log all admin actions (create, update, delete, publish)
- Store user, timestamp, action type, resource
- Queryable audit trail in admin dashboard

✅ **Data Validation**
- Pydantic models for request validation
- SQLModel type checking
- Content sanitization (XSS prevention)

---

## 7. Database Schema Changes

### Add to Prisma Schema (Migration)

```prisma
model Page {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String
  description   String?
  
  seoTitle      String?
  seoDescription String?
  seoKeywords   String?
  
  status        String   @default("draft") // draft, published, archived
  publishedAt   DateTime?
  
  createdBy     String?  @db.Text
  updatedBy     String?  @db.Text
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  blocks        PageBlock[]
}

model PageBlock {
  id            String   @id @default(cuid())
  pageId        String
  page          Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  type          String   // hero, text, image, services, etc.
  position      Int
  data          Json     // Flexible block content
  settings      Json     // Block styling settings
  
  isVisible     Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([pageId, position])
}

model AuditLog {
  id            String   @id @default(cuid())
  action        String   // page.created, page.updated, etc.
  actorId       String?
  summary       String
  metadata      Json?
  createdAt     DateTime @default(now())
}
```

Run migrations:
```bash
npx prisma migrate dev --name add-pages-and-blocks
npx prisma generate
```

### FastAPI SQLModel (Mirror Schema)

```python
# backend/app/models/__init__.py

from .page import Page, PageBlock, PageStatus
from .user import User, UserRole
from .blog import BlogPost
from .audit import AuditLog
# ... others
```

---

## 8. Docker Setup

### Backend Dockerfile

```dockerfile
# backend/docker/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run migrations
RUN alembic upgrade head

# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
# docker-compose.yml

version: "3.9"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: stephenasatsa_v2
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: backend/
      dockerfile: docker/Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/stephenasatsa_v2
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
      NEXTJS_REVALIDATE_SECRET: ${NEXTJS_REVALIDATE_SECRET}
      ADMIN_ALLOWED_ORIGIN: http://localhost:3000
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/stephenasatsa_v2
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
      FASTAPI_URL: http://backend:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
```

---

## 9. Migration Path (Old → New)

### Phase 1: Setup (1-2 hours)
1. Create `/backend` FastAPI project structure
2. Install dependencies (FastAPI, SQLModel, etc.)
3. Set up database models (Prisma & SQLModel)
4. Configure environment variables

### Phase 2: Core APIs (4-6 hours)
1. Auth routes (login, refresh, verify)
2. Migrate blog CRUD from Next.js API
3. Migrate media upload
4. Migrate testimonials, research, publications

### Phase 3: Dynamic Pages (3-4 hours)
1. Create Page & PageBlock models
2. Implement page CRUD endpoints
3. Build visual page editor UI

### Phase 4: Admin Dashboard (4-6 hours)
1. Update admin layout with new sidebar
2. Connect all CRUD operations to FastAPI
3. Add loading states, error handling
4. Implement real-time live preview
5. Add dark mode support

### Phase 5: Integration (2-4 hours)
1. ISR revalidation triggers
2. End-to-end testing
3. Security audit
4. Performance optimization

### Parallel: Documentation (Ongoing)
1. API documentation (FastAPI OpenAPI)
2. Setup instructions
3. Migration guide
4. Environment variable guide

---

## 10. Development Workflow

### Start Development Environment

```bash
# Install dependencies
pip install -r backend/requirements.txt
npm install --prefix frontend

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Or use Docker Compose (recommended)
docker-compose up -d

# Apply database migrations
cd backend && alembic upgrade head

# Start services
# Terminal 1: FastAPI
cd backend && uvicorn app.main:app --reload

# Terminal 2: Next.js
cd frontend && npm run dev

# View API docs
open http://localhost:8000/docs
open http://localhost:8000/redoc

# Access admin
open http://localhost:3000/admin
```

---

## 11. Post-Implementation Features

Once core setup is complete, add:

- [ ] Full-text search (Elasticsearch or PostgreSQL FTS)
- [ ] Analytics dashboard
- [ ] Content versioning/history
- [ ] Scheduling posts for future publication
- [ ] Collaborative editing (real-time)
- [ ] Custom block types
- [ ] A/B testing framework
- [ ] Multi-language support (i18n)
- [ ] API rate limiting
- [ ] Webhooks for external integrations
- [ ] GraphQL support (alongside REST)

---

# Next Steps

1. **Approve Architecture** - Review if this aligns with your vision
2. **Create Backend Project** - Set up FastAPI, SQLModel, database
3. **Implement Core APIs** - Auth, blog, media first
4. **Build Admin Dashboard** - Modern SideNav, pages editor
5. **Integration Testing** - End-to-end workflows
6. **Deploy** - Docker orchestration, CI/CD

Would you like me to proceed with implementation? I can start with:
- **Option A**: Complete FastAPI backend setup (main.py, dependencies, auth, database setup)
- **Option B**: Admin dashboard redesign (sidebar layout, page editor UI)
- **Option C**: Database schema and migrations
- **Option D**:Docker configuration
- **Option E**: All of the above (comprehensive implementation)

---

**Document Version**: 1.0  
**Created**: 2026-04-17  
**Status**: Ready for Implementation Planning
