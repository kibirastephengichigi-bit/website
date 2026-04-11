import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { siteContent } from "@/lib/content/site-content";
import { testimonialSchema } from "@/lib/validators/admin";

export async function GET() {
  if (db) {
    const testimonials = await db.testimonial.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(testimonials);
  }

  return NextResponse.json(siteContent.testimonials);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = testimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  if (db) {
    const testimonial = await db.testimonial.create({ data: parsed.data });
    return NextResponse.json(testimonial, { status: 201 });
  }

  return NextResponse.json({ success: true, draft: parsed.data }, { status: 201 });
}
