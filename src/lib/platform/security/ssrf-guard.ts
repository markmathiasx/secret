import { isIP } from "node:net";

const privateIPv4Ranges = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^0\./,
];

const privateHosts = new Set(["localhost", "0.0.0.0", "::1"]);

export function assertSafeHttpUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("blocked_protocol");
  }

  const hostname = url.hostname.toLowerCase();
  if (privateHosts.has(hostname)) {
    throw new Error("blocked_private_host");
  }

  if (isIP(hostname)) {
    if (hostname.includes(":") || privateIPv4Ranges.some((pattern) => pattern.test(hostname))) {
      throw new Error("blocked_private_ip");
    }
  }

  return url;
}
