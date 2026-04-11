import { NextResponse } from "next/server";

import { newsletterSchema } from "@/lib/validators/contact";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Newsletter signup captured. Connect this handler to ConvertKit, Mailchimp, Brevo, or another email platform in production.",
    data: parsed.data,
  });
}
