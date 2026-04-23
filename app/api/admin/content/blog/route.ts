import { NextRequest, NextResponse } from "next/server";
import { blogPosts as seedBlogPosts, blogContentBySlug as seedBlogContent } from "@/lib/content/blog-data";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    content: {
      blogPosts: seedBlogPosts,
      blogContentBySlug: seedBlogContent
    }
  });
}

export async function PUT(request: NextRequest) {
  try {
    const content = await request.json();
    
    // In a real implementation, you would save this to a database or file
    console.log("Blog content updated:", content);
    
    return NextResponse.json({
      success: true,
      message: "Blog content updated successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update blog content" },
      { status: 500 }
    );
  }
}

