import { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/app/api/admin/proxy";

export async function PUT(request: NextRequest) {
  return proxyAdminRequest(request, "user/password");
}
