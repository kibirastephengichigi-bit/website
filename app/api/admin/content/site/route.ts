import { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/app/api/admin/proxy";

export async function GET(request: NextRequest) {
  return proxyAdminRequest(request, "content/site");
}

export async function PUT(request: NextRequest) {
  return proxyAdminRequest(request, "content/site");
}

