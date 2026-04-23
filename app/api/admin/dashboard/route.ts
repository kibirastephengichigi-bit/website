import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    welcome: {
      title: "Website operations",
      subtitle: "Manage your website content, blog posts, and media from this admin dashboard.",
      username: "stephenasatsa",
      mfaConfigured: false
    },
    metrics: [
      { label: "Blog posts", value: 12 },
      { label: "Media items", value: 8 },
      { label: "Content sections", value: 6 },
      { label: "Recent activity", value: 24 }
    ],
    quickActions: [
      { id: "new-blog", label: "New blog post", section: "blog" as const },
      { id: "upload-media", label: "Upload media", section: "media" as const },
      { id: "edit-hero", label: "Edit hero", section: "content" as const },
      { id: "view-audit", label: "View audit log", section: "security" as const }
    ],
    auditEvents: [
      {
        id: "1",
        action: "login",
        actor: "stephenasatsa",
        summary: "Admin signed in successfully",
        createdAt: new Date().toISOString()
      },
      {
        id: "2", 
        action: "view",
        actor: "stephenasatsa",
        summary: "Viewed admin dashboard",
        createdAt: new Date(Date.now() - 60000).toISOString()
      }
    ]
  });
}

