import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_CREDENTIALS = {
  username: "stephenasatsa",
  password: "stephenasatsa_1234"
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Set admin session cookie
      const cookieStore = await cookies();
      cookieStore.set("admin-session", JSON.stringify({
        username: ADMIN_CREDENTIALS.username,
        loginTime: new Date().toISOString()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return NextResponse.json({ 
        success: true, 
        message: "Authentication successful",
        redirect: "/admin"
      });
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

