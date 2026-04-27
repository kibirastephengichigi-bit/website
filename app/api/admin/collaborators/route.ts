import { NextRequest } from "next/server";
import { proxyAdminRequest } from "@/app/api/admin/proxy";

export async function GET(request: NextRequest) {
  return proxyAdminRequest(request, "collaborators");
}

export async function POST(request: NextRequest) {
  return proxyAdminRequest(request, "collaborators");
}

export async function PUT(request: NextRequest) {
  return proxyAdminRequest(request, "collaborators");
}

export async function DELETE(request: NextRequest) {
  return proxyAdminRequest(request, "collaborators");
}
