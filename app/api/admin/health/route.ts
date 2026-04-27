import { NextRequest, NextResponse } from "next/server";
import { proxyAdminRequest } from "../proxy";

export async function GET(request: NextRequest) {
  return proxyAdminRequest(request, "health");
}
