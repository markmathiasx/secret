type RedisResult<T> = { result?: T; error?: string };

export async function redisRestCommand<T>(url: string, token: string, command: (string | number)[], timeoutMs = 700) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) throw new Error(`upstash_http_${response.status}`);
  const json = (await response.json()) as RedisResult<T>;
  if (json.error) throw new Error("upstash_command_error");
  return json.result ?? null;
}
