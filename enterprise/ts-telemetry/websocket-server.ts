import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const TelemetryEvent = z.object({
  printerId: z.string().min(1).max(80),
  jobId: z.string().min(1).max(120).optional(),
  temperatureNozzle: z.number().min(0).max(320).optional(),
  temperatureBed: z.number().min(0).max(140).optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(["idle", "printing", "paused", "finished", "error"]),
  timestamp: z.string().datetime().optional(),
});

type TelemetryEvent = z.infer<typeof TelemetryEvent>;

const memoryStore = new Map<string, TelemetryEvent>();

function saveEvent(event: TelemetryEvent) {
  const key = `${event.printerId}:${event.jobId || randomUUID()}`;
  memoryStore.set(key, { ...event, timestamp: event.timestamp || new Date().toISOString() });
  return key;
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/telemetry") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "not_found" }));
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const body = JSON.parse(Buffer.concat(chunks).toString("utf-8") || "{}");
  const parsed = TelemetryEvent.safeParse(body);
  if (!parsed.success) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "invalid_telemetry" }));
    return;
  }

  const id = saveEvent(parsed.data);
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ ok: true, id }));
});

server.listen(Number(process.env.PORT || 8787), () => {
  console.log(JSON.stringify({ module: "ts-telemetry", status: "listening", port: Number(process.env.PORT || 8787) }));
});
