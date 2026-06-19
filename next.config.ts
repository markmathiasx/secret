import type { NextConfig } from "next";
import { withBundleAnalyzer } from '@next/bundle-analyzer';
import { withSentryConfig } from "@sentry/nextjs";

function getHostname(value?: string) {
  if (!value) return null;

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const imageHosts = new Set([
  "images.unsplash.com",
  "images.ctfassets.net",
  "jimhpbvmvhgkfrtprvfs.supabase.co",
  "mdh3d.com.br",
  "www.mdh3d.com.br",
  "localhost",
  "127.0.0.1"
]);

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://http2.mlstatic.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com https://maps.googleapis.com https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com https://www.clarity.ms",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "media-src 'self' https: blob:",
  "font-src 'self' data: https://fonts.gstatic.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com",
  "connect-src 'self' https://api.mercadopago.com https://api-static.mercadopago.com https://secure-fields.mercadopago.com https://api.mercadolibre.com https://*.mercadolibre.com https://*.mercadolivre.com https://http2.mlstatic.com https://graph.facebook.com https://viacep.com.br https://www.melhorenvio.com.br https://sandbox.melhorenvio.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in https://maps.googleapis.com https://maps.gstatic.com https://www.google-analytics.com https://region1.google-analytics.com https://connect.facebook.net https://analytics.tiktok.com https://www.clarity.ms https://*.clarity.ms https://*.sentry.io https://ingest.sentry.io https://*.upstash.io",
  "frame-src https://www.mercadopago.com.br https://www.mercadopago.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com https://www.mercadolibre.com https://www.mercadolibre.com.br https://www.mercadolivre.com https://www.mercadolivre.com.br",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com https://www.mercadolibre.com https://www.mercadolibre.com.br https://www.mercadolivre.com https://www.mercadolivre.com.br",
  "frame-ancestors 'none'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const outputTraceExcludes = [
  // Public assets are served statically by Vercel and must not inflate API function bundles.
  "./public/products/**/*",
  "./public/catalog-assets/**/*",
  "./public/media/**/*",
  "./reports/**/*",
  "./assets/**/*",
  "./prompts_txt/**/*",
  "./SEU_PROJETO/**/*",
  "./test-results/**/*",
  "./.playwright-mcp/**/*",
  "./live-*.png",
  "./.tmp-*",
  "./estrutura.txt",
  // Test/dev tooling: never needed at runtime.
  "./node_modules/@playwright/**",
  "./node_modules/playwright/**",
  "./node_modules/playwright-core/**",
  "./node_modules/@jest/**",
  "./node_modules/jest/**",
  "./node_modules/jest-circus/**",
  "./node_modules/@swc/**",
  "./node_modules/ts-jest/**",
  "./node_modules/esbuild/**",
  // Prisma CLI & migration engines are build/dev tooling; @prisma/client remains runtime.
  "./node_modules/prisma/**",
  "./node_modules/@prisma/engines/**",
  "./node_modules/@prisma/migrate/**",
  "./node_modules/@prisma/studio/**",
  "./node_modules/@prisma/schema-files-loader/**",
  "./node_modules/@prisma/generator-helper/**",
  "./node_modules/@prisma/get-platform/**",
  "./node_modules/@prisma/debug/**",
  "./node_modules/@prisma/fetch-engine/**",
  "./node_modules/@prisma/config/**",
  "./node_modules/.prisma/client/query_engine-windows.dll.node",
  // Supabase CLI and type/dev packages are not runtime dependencies.
  "./node_modules/supabase/**",
  "./node_modules/typescript/**",
  "./node_modules/@types/**",
];

// Add the custom domain from NEXT_PUBLIC_SITE_URL to allowed image hosts
try {
  const siteUrlHost = process.env.NEXT_PUBLIC_SITE_URL && new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname;
  if (siteUrlHost) imageHosts.add(siteUrlHost);
} catch { /* ignore invalid URL */ }

[process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL]
  .map((value) => getHostname(value))
  .filter((value): value is string => Boolean(value))
  .forEach((host) => imageHosts.add(host));

const nextConfig: NextConfig = {
  // Performance & Optimization
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  outputFileTracingExcludes: {
    "/*": outputTraceExcludes,
    "/api/**/*": outputTraceExcludes,
  },

  // Images
  images: {
    remotePatterns: [
      ...Array.from(imageHosts).map((hostname) => ({
        protocol: "https",
        hostname
      })),
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1"
      }
    ],
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 85],
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  // Experimental Features (2026)
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  // Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Headers & Security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
          }
        ]
      },
      {
        source: '/checkout/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/conta/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/login/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/recuperar-senha/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/catalog-assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/products/models/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Apex -> www canonical redirect. The external domain already resolves
      // apex requests toward www, so keep application redirects aligned.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'mdh3d.com.br' }],
        destination: 'https://www.mdh3d.com.br/:path*',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/produtos',
        destination: '/catalogo',
        permanent: true,
      },
      {
        source: '/presentes',
        destination: '/presentes-3d',
        permanent: true,
      },
      {
        source: '/brindes',
        destination: '/brindes-personalizados-3d',
        permanent: true,
      },
      {
        source: '/personalizados',
        destination: '/imagem-para-impressao-3d',
        permanent: true,
      },
      {
        source: '/orcamento',
        destination: '/imagem-para-impressao-3d',
        permanent: true,
      },
      {
        source: '/minha-conta',
        destination: '/conta',
        permanent: true,
      }
    ];
  },

  // Rewrites
  async rewrites() {
    return [];
  },

  // Webpack Configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Mark server-only modules as external on client builds to prevent bundling
    if (!isServer) {
      config.externals = {
        ...config.externals,
        nodemailer: 'commonjs nodemailer',
        'nodemailer/lib/mailer': 'commonjs nodemailer/lib/mailer',
        'server-only': 'commonjs server-only',
      };
    }

    // Add custom webpack optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        supabase: {
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          name: 'supabase',
          chunks: 'all',
          priority: 20,
        },
      };
    }

    // SVG Support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Build ID for cache busting
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Output: standalone only for Docker/self-hosted; Vercel manages bundling itself
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  // Keep large server-side packages as externals (not inlined into webpack bundles)
  serverExternalPackages: ['@prisma/client', '.prisma'],

  // Environment variables
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  },
};

const baseConfig = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(nextConfig)
  : nextConfig;

export default process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(baseConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    })
  : baseConfig;
