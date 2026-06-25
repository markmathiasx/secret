export type LocalAgentConfig = {
  siteUrl: string;
  sharedSecret: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  mode: string;
  pollIntervalMs: number;
  maxTasksPerRun: number;
  workdir: string;
  allowGit: boolean;
  allowPush: boolean;
  allowDeploy: boolean;
  allowPr: boolean;
};

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getLocalAgentConfig(): LocalAgentConfig {
  return {
    siteUrl: process.env.LOCAL_AGENT_SITE_URL || "https://www.mdh3d.com.br",
    sharedSecret: process.env.LOCAL_AGENT_SHARED_SECRET || "",
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
    ollamaModel: process.env.OLLAMA_MODEL || "qwen3-mark-pensador",
    mode: process.env.LOCAL_AGENT_MODE || "operator",
    pollIntervalMs: Number(process.env.LOCAL_AGENT_POLL_INTERVAL_MS || 15000),
    maxTasksPerRun: Number(process.env.LOCAL_AGENT_MAX_TASKS_PER_RUN || 3),
    workdir: process.env.LOCAL_AGENT_WORKDIR || process.cwd(),
    allowGit: bool(process.env.LOCAL_AGENT_ALLOW_GIT, true),
    allowPush: bool(process.env.LOCAL_AGENT_ALLOW_PUSH, false),
    allowDeploy: bool(process.env.LOCAL_AGENT_ALLOW_DEPLOY, false),
    allowPr: bool(process.env.LOCAL_AGENT_ALLOW_PR, true),
  };
}
