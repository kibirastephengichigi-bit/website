import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validators/contact";

// Simple in-memory rate limiter (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number = 3, windowMs: number = 300000): boolean {
  const now = Date.now();
  const windowKey = Math.floor(now / windowMs);
  const key = `${ip}:${windowKey}`;

  const current = rateLimit.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  rateLimit.set(key, current);
  return true;
}

function validateCSRFToken(token: string): boolean {
  // Simple validation - in production, use proper CSRF tokens
  return token.length >= 16;
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") ||
               request.headers.get("x-real-ip") ||
               "unknown";

    // Rate limiting (stricter for newsletter)
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // CSRF validation
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 403 }
      );
    }

    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Check honeypot field
    if (parsed.data.website && parsed.data.website.length > 0) {
      // Likely a bot - silently reject
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    // Additional security: sanitize input
    const sanitizedData = {
      email: parsed.data.email.toLowerCase().trim(),
    };

    // Log the newsletter signup (in production, add to email list)
    console.log("Newsletter signup:", {
      ip,
      timestamp: new Date().toISOString(),
      data: sanitizedData,
    });

    return NextResponse.json({
      success: true,
      message: "Newsletter signup captured. Connect this handler to ConvertKit, Mailchimp, Brevo, or another email platform in production.",
      data: sanitizedData,
    });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
