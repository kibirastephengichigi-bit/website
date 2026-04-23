import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    items: []
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // In a real implementation, you would save the file to storage
    console.log("File uploaded:", file.name);
    
    return NextResponse.json({
      item: {
        id: Date.now().toString(),
        fileName: file.name,
        url: `/uploads/admin/${file.name}`,
        altText: "",
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

