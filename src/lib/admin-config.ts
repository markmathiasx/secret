export const adminConfig = {
  email: process.env.ADMIN_EMAIL || "admin@mdh3d.local",
  hiddenPath: "/painel-mdh-85",
  sessionCookieName: "mdh_admin",
  sessionToken: process.env.ADMIN_SESSION_TOKEN || "mdh_troque_este_token_no_env"
};
