export function summarizeTaskContext(text: string, maxLength = 4000) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n[truncated by local-agent summarizer]` : text;
}
