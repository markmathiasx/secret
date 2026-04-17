import type { NextConfig } from "next";
import { withBundleAnalyzer } from '@next/bundle-analyzer';

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
  "mdh-3d-store.vercel.app",
  "picsum.photos",
  "localhost",
  "127.0.0.1"
]);

[process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL]
  .map((value) => getHostname(value))
  .filter((value): value is string => Boolean(value))
  .forEach((host) => imageHosts.add(host));

const nextConfig: NextConfig = {
  // Performance & Optimization
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

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
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
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
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/loja',
        destination: '/catalogo',
        permanent: true,
      },
      {
        source: '/loja/:path*',
        destination: '/catalogo',
        permanent: true,
      },
      {
        source: '/produtos',
        destination: '/catalogo',
        permanent: true,
      },
      {
        source: '/produto/:slug*',
        destination: '/catalogo/:slug*',
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
        source: '/carrinho',
        destination: '/checkout',
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

  // Output configuration
  output: 'standalone',

  // Environment variables
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  },
};

export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(nextConfig)
  : nextConfig;
