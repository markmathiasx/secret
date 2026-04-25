import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    release: process.env.BUILD_ID || undefined,

    // Edge runtime — keep sample rate very low (edge functions fire a LOT)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.02 : 1.0,

    ignoreErrors: [
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],

    beforeSend(event) {
      if (event.request?.url?.includes("/api/health")) return null;
      return event;
    },
  });
}
