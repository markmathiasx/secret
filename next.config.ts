import type { NextConfig } from "next";

function getHostname(value?: string) {
  if (!value) return null;

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const imageHosts = new Set(["images.unsplash.com", "images.ctfassets.net", "jimhpbvmvhgkfrtprvfs.supabase.co"]);

[process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL]
  .map((value) => getHostname(value))
  .filter((value): value is string => Boolean(value))
  .forEach((host) => imageHosts.add(host));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: Array.from(imageHosts).map((hostname) => ({
      protocol: "https",
      hostname
    }))
  }
};

export default nextConfig;
