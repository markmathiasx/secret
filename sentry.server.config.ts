import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    release: process.env.BUILD_ID || undefined,

    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

    // Don't capture expected operational errors
    ignoreErrors: [
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],

    beforeSend(event, hint) {
      // Drop health-check requests from monitors
      if (event.request?.url?.includes("/api/health")) return null;
      if (event.request?.url?.includes("/api/catalog/health")) return null;

      // Strip PII from request URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/([?&])(email|token|cpf|telefone|password)=[^&]*/gi, "$1$2=[redacted]");
      }

      // Add context about DB connectivity if error is DB-related
      const err = hint?.originalException;
      if (err instanceof Error && err.message.includes("Can't reach database")) {
        event.tags = { ...event.tags, db_unreachable: "true" };
      }

      return event;
    },
  });
}
