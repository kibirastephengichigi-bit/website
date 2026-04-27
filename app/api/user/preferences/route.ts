import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await db.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ preferences });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const preferences = await db.userPreference.upsert({
    where: { userId: session.user.id },
    update: {
      newsletterSubscribed: Boolean(body.newsletterSubscribed),
      productUpdates: Boolean(body.productUpdates),
      analyticsConsent: Boolean(body.analyticsConsent),
      marketingConsent: Boolean(body.marketingConsent),
      cookieConsentLevel: String(body.cookieConsentLevel || "essential"),
      theme: String(body.theme || "light"),
      locale: String(body.locale || "en"),
    },
    create: {
      userId: session.user.id,
      newsletterSubscribed: Boolean(body.newsletterSubscribed),
      productUpdates: Boolean(body.productUpdates),
      analyticsConsent: Boolean(body.analyticsConsent),
      marketingConsent: Boolean(body.marketingConsent),
      cookieConsentLevel: String(body.cookieConsentLevel || "essential"),
      theme: String(body.theme || "light"),
      locale: String(body.locale || "en"),
    },
  });

  return NextResponse.json({ preferences });
}

