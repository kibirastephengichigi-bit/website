import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { siteContent } from "@/lib/content/site-content";
import { slugify } from "@/lib/utils";
import { publicationSchema } from "@/lib/validators/admin";

export async function GET() {
  if (db) {
    const publications = await db.publication.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(publications);
  }

  return NextResponse.json(siteContent.publications);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = publicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  if (db) {
    const publication = await db.publication.create({
      data: {
        ...parsed.data,
        slug: slugify(parsed.data.title),
        authors: "Dr. Stephen Asatsa",
      },
    });
    return NextResponse.json(publication, { status: 201 });
  }

  return NextResponse.json({ success: true, draft: parsed.data }, { status: 201 });
}
