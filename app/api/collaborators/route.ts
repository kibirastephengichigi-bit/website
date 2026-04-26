import { NextResponse } from "next/server";

const BACKEND_BASE = process.env.ADMIN_BACKEND_URL || "http://localhost:8000/api";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_BASE}/collaborators`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch collaborators" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 502 }
    );
  }
}
