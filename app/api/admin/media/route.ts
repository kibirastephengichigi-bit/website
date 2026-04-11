import { NextResponse } from "next/server";

const mediaLibrary = [
  { title: "Hero portrait", url: "/assets/people/hero.jpeg", kind: "image" },
  { title: "Gallery image", url: "/assets/gallery/asatsa-7.jpeg", kind: "image" },
  { title: "Stephen CV 2025", url: "/Stephen_Asatsa-CV-2025.pdf", kind: "pdf" },
];

export async function GET() {
  return NextResponse.json({
    provider: "Cloudinary-ready",
    items: mediaLibrary,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    {
      success: true,
      message:
        "Media metadata received. Connect this route to Cloudinary or UploadThing server-side upload logic in production.",
      data: body,
    },
    { status: 201 },
  );
}
