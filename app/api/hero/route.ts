import { NextResponse } from "next/server";
import { proxyAdminRequest } from "@/components/api/client";

export async function GET() {
  try {
    const response = await proxyAdminRequest(new Request("http://localhost"), "/api/hero");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ hero: null });
  }
}
