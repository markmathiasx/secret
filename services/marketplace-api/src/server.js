import { createApp } from "./app.js";
import pg from "pg";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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
const app = createApp({
  db,
  verifyToken: (token) => getAuth().verifyIdToken(token, true),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "",
});
const server = app.listen(Number(process.env.PORT || 8080));
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await db.end();
      process.exit(0);
    }),
  );
