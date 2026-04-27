import { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/app/api/admin/proxy";

export async function POST(request: NextRequest) {
  return proxyAdminRequest(request, "user/display-name");
}
