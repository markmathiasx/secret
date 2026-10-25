import { createApp } from "./app.js";
import pg from "pg";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { MercadoPagoPix } from "./mercado-pago.js";
if (!process.env.DATABASE_URL || !process.env.FIREBASE_PROJECT_ID)
  throw new Error("DATABASE_URL and FIREBASE_PROJECT_ID required");
initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
});
const liveMode = process.env.MERCADOPAGO_LIVE_MODE;
let validNotificationUrl = false;
try {
  const notificationUrl = new URL(process.env.MERCADOPAGO_NOTIFICATION_URL || "");
  validNotificationUrl = notificationUrl.protocol === "https:" && !notificationUrl.username && !notificationUrl.password;
} catch {}
const paymentSettings =
  typeof process.env.MERCADOPAGO_ACCESS_TOKEN === "string" &&
  /^\S{20,}$/.test(process.env.MERCADOPAGO_ACCESS_TOKEN) &&
  validNotificationUrl &&
  typeof process.env.MERCADOPAGO_WEBHOOK_SECRET === "string" &&
  process.env.MERCADOPAGO_WEBHOOK_SECRET.length >= 16 &&
  /^\d{1,30}$/.test(process.env.MERCADOPAGO_COLLECTOR_ID || "") &&
  ["true", "false"].includes(liveMode)
    ? {
        collectorId: process.env.MERCADOPAGO_COLLECTOR_ID,
        liveMode: liveMode === "true",
        webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
      }
    : null;
const paymentProvider = paymentSettings
  ? new MercadoPagoPix({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      notificationUrl: process.env.MERCADOPAGO_NOTIFICATION_URL,
    })
  : null;
const app = createApp({
  db,
  verifyToken: (token) => getAuth().verifyIdToken(token, true),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "",
  paymentProvider,
  paymentSettings,
});
const server = app.listen(Number(process.env.PORT || 8080));
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await db.end();
      process.exit(0);
    }),
  );
