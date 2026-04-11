import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { siteContent } from "@/lib/content/site-content";
import { slugify } from "@/lib/utils";
import { researchSchema } from "@/lib/validators/admin";

export async function GET() {
  if (db) {
    const projects = await db.researchProject.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(projects);
  }

  return NextResponse.json(siteContent.researchProjects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = researchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  if (db) {
    const project = await db.researchProject.create({
      data: {
        ...parsed.data,
        slug: slugify(parsed.data.title),
      },
    });
    return NextResponse.json(project, { status: 201 });
  }

  return NextResponse.json({ success: true, draft: parsed.data }, { status: 201 });
}
