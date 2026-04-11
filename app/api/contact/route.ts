import { NextResponse } from "next/server";

import { contactSchema } from "@/lib/validators/contact";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Contact request received. Wire this handler to Resend, SMTP, or another transactional email service for production notifications.",
    data: parsed.data,
  });
}
