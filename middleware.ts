import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting store (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
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

function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || "";
  const suspiciousPatterns = [
    /sqlmap/i,
    /nmap/i,
    /masscan/i,
    /dirbuster/i,
    /gobuster/i,
    /nikto/i,
    /acunetix/i,
    /openvas/i,
    /nessus/i,
    /qualys/i,
    /rapid7/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ||
             request.headers.get("x-real-ip") ||
             request.ip ||
             "unknown";

  // Basic rate limiting
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  // Block suspicious requests
  if (isSuspiciousRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Add security headers
  const response = NextResponse.next();

  // Additional headers that can't be set in next.config.ts
  response.headers.set("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");

  // Only add HSTS for HTTPS requests
  if (request.url.startsWith("https://")) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};