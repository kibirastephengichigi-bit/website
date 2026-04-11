import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { siteContent } from "@/lib/content/site-content";

export async function GET() {
  if (db) {
    const content = await db.siteContent.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(content);
  }

  return NextResponse.json({
    about: siteContent.aboutFull,
    hero: siteContent.hero,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (db && body?.key && body?.title && body?.body) {
    const content = await db.siteContent.upsert({
      where: { key: body.key },
      update: {
        title: body.title,
        body: body.body,
      },
      create: {
        key: body.key,
        title: body.title,
        body: body.body,
      },
    });

    return NextResponse.json(content, { status: 201 });
  }

  return NextResponse.json({ success: true, data: body }, { status: 201 });
}
