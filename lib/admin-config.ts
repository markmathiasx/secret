export const adminConfig = {
  email: process.env.ADMIN_EMAIL || "markmathias02@gmail.com",
  hiddenPath: process.env.ADMIN_HIDDEN_PATH || "/admin",
  sessionCookieName: "mdh_admin",
  legacySessionToken: process.env.ADMIN_SESSION_TOKEN || "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_TOKEN || "",
  sessionToken: process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_SESSION_SECRET || "",
  passwordHash: process.env.ADMIN_PASSWORD_HASH || "",
};
