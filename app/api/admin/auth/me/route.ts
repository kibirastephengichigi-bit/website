import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin-session");
    
    if (!adminSession) {
      return NextResponse.json(
        { error: "No admin session found" },
        { status: 401 }
      );
    }

    try {
      const sessionData = JSON.parse(adminSession.value);
      return NextResponse.json({
        authenticated: true,
        username: sessionData.username,
        loginTime: sessionData.loginTime
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid session format" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

