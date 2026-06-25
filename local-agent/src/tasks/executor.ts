import { spawnSync } from "node:child_process";
import type { LocalAgentConfig } from "../config.ts";
import { callOllama } from "../ollama/client.ts";
import { isAllowedCommand } from "../safety/allowlist.ts";
import { isDeniedCommand } from "../safety/denylist.ts";
import { classifyPatchSafety } from "../safety/patch-guard.ts";
import { redactLocalAgentSecrets } from "../safety/secrets-redactor.ts";

export function executeAllowedCommand(config: LocalAgentConfig, command: string) {
  if (isDeniedCommand(command) || !isAllowedCommand(command)) {
    return { ok: false, blocked: true, command, output: "command_blocked_by_local_agent_policy" };
  }

  if (!command.startsWith("git ") && /push|deploy/i.test(command)) {
    return { ok: false, blocked: true, command, output: "deploy_or_push_blocked" };
  }

  const [bin, ...args] = command.split(/\s+/);
  const result = spawnSync(bin, args, {
    cwd: config.workdir,
    encoding: "utf8",
    shell: false,
    timeout: 120_000,
  });

  return {
    ok: result.status === 0,
    blocked: false,
    command,
    status: result.status,
    output: redactLocalAgentSecrets(`${result.stdout || ""}\n${result.stderr || ""}`.slice(0, 12000)),
  };
}

export async function executeTask(config: LocalAgentConfig, task: { type: string; payload: Record<string, unknown> }) {
  if (task.type === "ai_patch_proposal") {
    return {
      ok: true,
      type: task.type,
      policy: classifyPatchSafety(JSON.stringify(task.payload)),
      message: "Patch proposal requires tests and human review; no deploy or main push allowed.",
    };
  }

  try {
    const prompt = `MDH3D local operator task: ${task.type}\nPayload: ${JSON.stringify(task.payload).slice(0, 4000)}`;
    const result = await callOllama(config, prompt);
    return {
      ok: true,
      type: task.type,
      model: config.ollamaModel,
      response: result.response || "",
    };
  } catch (error) {
    return {
      ok: false,
      type: task.type,
      controlledFailure: true,
      error: error instanceof Error ? error.message : "unknown_local_agent_error",
    };
  }
}
