import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const backendDir = process.env.BACKEND_DIR || "/home/codecrafter/Documents/combined/website/backend";
    // Use monitor action which checks sessions and stops only if no active sessions
    const command = `cd ${backendDir} && python admin_backend_manager.py monitor`;
    
    await execAsync(command);
    
    return NextResponse.json({ success: true, message: "Backend monitor check completed" });
  } catch (error) {
    console.error("Failed to run backend monitor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run backend monitor" },
      { status: 500 }
    );
  }
}
