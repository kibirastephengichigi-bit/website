import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators/contact";

// Simple in-memory rate limiter (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
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
  // This is a basic check; implement proper CSRF validation
  return token.length >= 16;
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") ||
               request.headers.get("x-real-ip") ||
               "unknown";

    // Rate limiting
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

    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Additional security: sanitize input
    const sanitizedData = {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      message: parsed.data.message.trim(),
    };

    // Log the contact attempt (in production, send email)
    console.log("Contact form submission:", {
      ip,
      timestamp: new Date().toISOString(),
      data: sanitizedData,
    });

    return NextResponse.json({
      success: true,
      message: "Contact request received. Wire this handler to Resend, SMTP, or another transactional email service for production notifications.",
      data: sanitizedData,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
