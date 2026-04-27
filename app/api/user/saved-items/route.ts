import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.savedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const item = await db.savedItem.upsert({
    where: {
      userId_type_key: {
        userId: session.user.id,
        type: String(body.type),
        key: String(body.key),
      },
    },
    update: {
      title: String(body.title),
      href: String(body.href),
      image: body.image ? String(body.image) : null,
    },
    create: {
      userId: session.user.id,
      type: String(body.type),
      key: String(body.key),
      title: String(body.title),
      href: String(body.href),
      image: body.image ? String(body.image) : null,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  await db.savedItem.deleteMany({
    where: {
      userId: session.user.id,
      type: String(body.type),
      key: String(body.key),
    },
  });

  return NextResponse.json({ deleted: true });
}

