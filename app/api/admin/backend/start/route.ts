import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const backendDir = process.env.BACKEND_DIR || process.cwd() + "/backend";
    const command = `cd ${backendDir} && python admin_backend_manager.py start`;
    
    await execAsync(command);
    
    return NextResponse.json({ success: true, message: "Backend started" });
  } catch (error) {
    console.error("Failed to start backend:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start backend" },
      { status: 500 }
    );
  }
}
