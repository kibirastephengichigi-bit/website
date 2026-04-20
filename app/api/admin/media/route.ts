import { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/app/api/admin/proxy";

export async function GET(request: NextRequest) {
  return proxyAdminRequest(request, "media");
}

export async function POST(request: NextRequest) {
  return proxyAdminRequest(request, "media");
}

