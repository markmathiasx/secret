export function getRuntimeRegion() {
  return {
    vercelRegion: process.env.VERCEL_REGION || "local",
    vercelEnv: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    selfHostReady: true,
  };
}
