import { proxyAdminRequest } from "@/components/api/client";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/api/external-profiles");
}

export async function POST(request: Request) {
  return proxyAdminRequest(request, "/api/external-profiles");
}

export async function PUT(request: Request) {
  return proxyAdminRequest(request, "/api/external-profiles");
}

export async function DELETE(request: Request) {
  return proxyAdminRequest(request, "/api/external-profiles");
}
