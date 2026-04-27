import { NextResponse } from "next/server";
import { proxyAdminRequest } from "@/components/api/client";

export async function GET() {
  try {
    const response = await proxyAdminRequest(new Request("http://localhost"), "/api/services");
    const data = await response.json();
    // Filter to only published items for public API
    const published = data.services?.filter((item: any) => item.published) || [];
    return NextResponse.json({ services: published });
  } catch (error) {
    return NextResponse.json({ services: [] });
  }
}
