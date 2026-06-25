import type { LocalAgentConfig } from "../config.ts";
import { pullLocalAgentTask, postLocalAgentResult } from "../site/client.ts";
import { executeTask } from "./executor.ts";

export async function pollOnce(config: LocalAgentConfig) {
  const response = await pullLocalAgentTask(config);
  if (!response.task) return { ok: true, idle: true };
  const result = await executeTask(config, response.task);
  await postLocalAgentResult(config, response.task.id, result, result.ok !== false);
  return { ok: true, idle: false, taskId: response.task.id, result };
}
