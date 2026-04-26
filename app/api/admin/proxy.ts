import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = process.env.ADMIN_BACKEND_URL || "http://localhost:8000/api";

export async function proxyAdminRequest(request: NextRequest, endpoint: string) {
  const target = `${BACKEND_BASE}/${endpoint}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  // Forward the session cookie from the request
  const sessionCookie = request.cookies.get('admin_session');
  if (sessionCookie) {
    headers.set('Cookie', `admin_session=${sessionCookie.value}`);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    credentials: 'include',
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(target, init);
    const nextResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
    });

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        nextResponse.headers.set(key, value);
      }
    });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error) {
    console.error(`Proxy error for ${target}:`, error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to connect to backend", message: error instanceof Error ? error.message : "Unknown error" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

