export function redactLocalAgentSecrets(value: string) {
  return value.replace(/(sk-[a-z0-9_-]{20,}|gh[pousr]_[a-z0-9_]{20,}|APP_USR-[a-z0-9_-]{20,})/gi, "[redacted]");
}
