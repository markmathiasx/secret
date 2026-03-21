import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "mdh-3d-store",
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    buildId: process.env.BUILD_ID || "development",
    nodeEnv: process.env.NODE_ENV || "development",
  });
}
