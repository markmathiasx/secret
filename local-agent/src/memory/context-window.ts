export function buildContextWindow(parts: string[], maxLength = 12000) {
  let output = "";
  for (const part of parts) {
    if (output.length + part.length > maxLength) break;
    output += `${part}\n`;
  }
  return output.trim();
}
