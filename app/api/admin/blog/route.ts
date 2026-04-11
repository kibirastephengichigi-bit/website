import { NextResponse } from "next/server";

import { blogPosts } from "@/lib/content/blog-data";
import { db } from "@/lib/db";
import { blogPostSchema } from "@/lib/validators/admin";

export async function GET() {
  if (db) {
    const posts = await db.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(posts);
  }

  return NextResponse.json(blogPosts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = blogPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  if (db) {
    const post = await db.blogPost.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  }

  return NextResponse.json(
    { success: true, draft: parsed.data, note: "Database not configured yet." },
    { status: 201 },
  );
}
