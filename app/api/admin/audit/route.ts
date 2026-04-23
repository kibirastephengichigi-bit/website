import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    events: [
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
      },
      {
        id: "3",
        action: "content_update",
        actor: "stephenasatsa",
        summary: "Updated site content",
        createdAt: new Date(Date.now() - 120000).toISOString()
      }
    ]
  });
}

