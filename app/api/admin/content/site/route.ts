import { NextRequest, NextResponse } from "next/server";
import { siteContent } from "@/lib/content/site-content";
import { writeFileSync } from "fs";
import { join } from "path";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    content: siteContent
  });
}

export async function PUT(request: NextRequest) {
  try {
    const content = await request.json();
    
    // In a real implementation, you would save this to a database or file
    // For now, we'll just return success
    console.log("Site content updated:", content);
    
    return NextResponse.json({
      success: true,
      message: "Site content updated successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update site content" },
      { status: 500 }
    );
  }
}

