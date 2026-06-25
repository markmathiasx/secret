import net from "node:net";

function encodeRedisCommand(parts: (string | number)[]) {
  return `*${parts.length}\r\n${parts.map((part) => {
    const value = String(part);
    return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
  }).join("")}`;
}

function parseSimpleRedisResponse(raw: string) {
  if (raw.startsWith("+")) return raw.slice(1).trim();
  if (raw.startsWith(":")) return Number(raw.slice(1).trim());
  if (raw.startsWith("$-1")) return null;
  if (raw.startsWith("$")) {
    const [, body = ""] = raw.split(/\r\n/);
    return body;
  }
  if (raw.startsWith("-")) throw new Error("redis_tcp_error");
  return raw.trim();
}

export function redisTcpCommand(redisUrl: string, command: (string | number)[], timeoutMs = 800): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const url = new URL(redisUrl);
    const socket = net.createConnection({
      host: url.hostname,
      port: Number(url.port || 6379),
      timeout: timeoutMs,
    });
    let payload = "";

    socket.on("connect", () => {
      const commands: (string | number)[][] = [];
      if (url.password) commands.push(["AUTH", url.password]);
      commands.push(command);
      socket.write(commands.map(encodeRedisCommand).join(""));
    });
    socket.on("data", (chunk) => {
      payload += chunk.toString("utf8");
    });
    socket.on("error", reject);
    socket.on("timeout", () => {
      socket.destroy(new Error("redis_tcp_timeout"));
    });
    socket.on("close", () => {
      try {
        const responses = payload.split(/\r\n(?=[+:$-])/).filter(Boolean);
        resolve(parseSimpleRedisResponse(responses[responses.length - 1] || payload));
      } catch (error) {
        reject(error);
      }
    });
  });
}
