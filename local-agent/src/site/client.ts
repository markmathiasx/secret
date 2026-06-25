import type { LocalAgentConfig } from "../config.ts";

export async function pullLocalAgentTask(config: LocalAgentConfig) {
  if (!config.sharedSecret) throw new Error("LOCAL_AGENT_SHARED_SECRET missing");
  const response = await fetch(new URL("/api/local-agent/tasks", config.siteUrl), {
    headers: { "x-local-agent-secret": config.sharedSecret },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`site_tasks_http_${response.status}`);
  return (await response.json()) as { ok: boolean; task?: { id: string; type: string; payload: Record<string, unknown> } | null };
}

export async function postLocalAgentResult(config: LocalAgentConfig, taskId: string, result: Record<string, unknown>, ok = true) {
  if (!config.sharedSecret) throw new Error("LOCAL_AGENT_SHARED_SECRET missing");
  const response = await fetch(new URL(`/api/local-agent/tasks/${taskId}/result`, config.siteUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-local-agent-secret": config.sharedSecret },
    body: JSON.stringify({ ok, result }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`site_result_http_${response.status}`);
  return response.json();
}
