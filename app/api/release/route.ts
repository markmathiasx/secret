import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    {
      service: "mdh3d",
      release:
        process.env.MDH_RELEASE_SHA ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        "unknown",
      branch:
        process.env.MDH_RELEASE_BRANCH ||
        process.env.VERCEL_GIT_COMMIT_REF ||
        "unknown",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}