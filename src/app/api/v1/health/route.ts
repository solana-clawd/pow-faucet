import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    version: "1.0.0",
    network: "devnet",
    programId: "PoWSNH2hEZogtCg1Zgm51FnkmJperzYDgPK4fvs8taL",
    timestamp: new Date().toISOString(),
  });
}
