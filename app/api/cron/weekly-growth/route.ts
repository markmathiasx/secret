import { NextResponse } from "next/server";
import {
  buildWeeklyGrowthDashboard,
  persistWeeklyGrowthDashboard,
} from "@/lib/weekly-growth-dashboard";

function isAuthorized(request: Request) {
  const expected = (process.env.CRON_SECRET || "").trim();
  if (!expected) return true;

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  const headerToken = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  return queryToken === expected || headerToken === expected || authHeader === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await buildWeeklyGrowthDashboard();
  const stored = await persistWeeklyGrowthDashboard(report);

  return NextResponse.json({
    ok: true,
    stored,
    report,
  });
}
