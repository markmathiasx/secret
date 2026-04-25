import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    release: process.env.BUILD_ID || undefined,

    // Sample 10% of traces in prod, 100% in dev
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Replay only on errors in prod (session replay 5%)
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],

    // Suppress noisy browser errors not actionable by us
    ignoreErrors: [
      // Network errors
      "Network request failed",
      "Failed to fetch",
      "NetworkError",
      "Load failed",
      // Browser extension noise
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Script blocking (ad blockers, etc.)
      /^Script error\.?$/,
      // Safari-specific
      "The operation couldn\u2019t be completed",
    ],

    beforeSend(event, hint) {
      const err = hint?.originalException;

      // Drop health-check noise (shouldn't happen on client but just in case)
      if (event.request?.url?.includes("/api/health")) return null;

      // Drop not-found errors from bots hitting random paths
      if (event.exception?.values?.[0]?.value?.includes("NEXT_NOT_FOUND")) return null;

      // Don't send errors from browser extensions
      const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
      if (frames.some((f) => f.filename?.includes("extension://"))) return null;

      // Strip PII from request URLs (query strings with email/token/cpf)
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/([?&])(email|token|cpf|telefone)=[^&]*/gi, "$1$2=[redacted]");
      }

      // Log locally so devs see the event even when Sentry isn't capturing
      if (process.env.NODE_ENV === "development") {
        console.error("[Sentry]", err instanceof Error ? err.message : event.message);
      }

      return event;
    },
  });
}
