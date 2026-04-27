import { NextResponse } from "next/server";
import { proxyAdminRequest } from "@/components/api/client";

export async function GET() {
  try {
    const response = await proxyAdminRequest(new Request("http://localhost"), "/api/awards");
    const data = await response.json();
    
    // Filter to only published items for public API
    const published = data.awards?.filter((item: any) => item.published) || [];
    
    return NextResponse.json({ awards: published });
  } catch (error) {
    return NextResponse.json({ awards: [] });
  }
}
