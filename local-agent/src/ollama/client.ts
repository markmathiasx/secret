import type { LocalAgentConfig } from "../config.ts";

export async function callOllama(config: LocalAgentConfig, prompt: string) {
  const url = new URL("/api/generate", config.ollamaBaseUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollamaModel,
      prompt,
      stream: false,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) throw new Error(`ollama_http_${response.status}`);
  return (await response.json()) as { response?: string };
}
