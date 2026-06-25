import { sanitizeError } from "@/src/lib/platform/security/sanitize";

export class PlatformDatabaseError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PlatformDatabaseError";
    this.code = code;
  }
}

export function sanitizeDatabaseError(error: unknown) {
  return sanitizeError(error);
}
