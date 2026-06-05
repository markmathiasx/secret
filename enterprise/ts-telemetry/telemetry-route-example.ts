import { NextResponse } from "next/server";
import { z } from "zod";

const TelemetryEvent = z.object({
  printerId: z.string().min(1).max(80),
  status: z.enum(["idle", "printing", "paused", "finished", "error"]),
  progress: z.number().min(0).max(100).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = TelemetryEvent.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_telemetry" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, event: parsed.data });
}
