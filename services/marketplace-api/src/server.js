import { createApp } from "./app.js";
import { createServer } from "node:http";
import pg from "pg";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { MercadoPagoPix } from "./mercado-pago.js";
import { hardenHttpServer, logForensic } from "./http-security.js";
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
  trustProxy: process.env.TRUST_PROXY === "1" ? 1 : false,
  paymentProvider,
  paymentSettings,
});
const server = hardenHttpServer(createServer({ maxHeaderSize: 16 * 1024 }, app));
server.on("clientError", (_error, socket) => {
  if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
});
server.listen(Number(process.env.PORT || 8080));
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    const forceExit = setTimeout(() => process.exit(1), 10_000);
    forceExit.unref();
    server.close(async () => {
      await db.end();
      clearTimeout(forceExit);
      process.exit(0);
    });
  });
db.on("error", (error) => {
  logForensic(console, "error", "database_pool_error", {
    code: typeof error?.code === "string" && /^[A-Z0-9_]{1,40}$/.test(error.code) ? error.code.toLowerCase() : "internal",
  });
});
