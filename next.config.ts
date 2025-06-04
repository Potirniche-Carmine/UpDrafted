import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move serverComponentsExternalPackages to root level (outside experimental)
  serverExternalPackages: ['@neondatabase/serverless'],
  
  images: {
    dangerouslyAllowSVG: true,
    // Add local patterns for static assets
    localPatterns: [
      {
        pathname: '/logo.png',
        search: '',
      },
      {
        pathname: '/assets/**',
        search: '',
      },
      {
        pathname: '/images/**',
        search: '',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-19c0754937db426497ca014f0e2a297c.r2.dev',
        port: '',
        pathname: '/**',
      }
    ],
    // Optimize image formats and quality for cost efficiency
    formats: ['image/webp', 'image/avif'],
    // Extended cache TTL - organization logos don't change often
    minimumCacheTTL: 31536000, // 1 year cache
    // Optimized device sizes for common use cases
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Optimized image sizes - including our 80px organization logo size
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 256],
    // Disable optimization for very small images (under 10KB as recommended)
    unoptimized: false,
    // Quality settings for different use cases
    loader: 'default',
  },
  // Additional optimizations for cost efficiency
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Optimize for Node.js runtime where possible
    serverActions: {
      allowedOrigins: ['localhost:3000', 'updrafted.carmine.live'],
    },
    // Minimize middleware processing
    middlewarePrefetch: 'flexible',
  },
  // Force static optimization where possible
  trailingSlash: false,
  compress: true,
  // Optimize headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ],
    },
    // Aggressive caching for favicon to reduce bot-driven edge invocations
    {
      source: '/favicon.ico',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable' // 1 year cache
        }
      ],
    },
    // Aggressive caching for all static assets - fix the regex pattern
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable' // 1 year cache for static assets
        }
      ],
    },
    // Cache for common static file extensions
    {
      source: '/:path*\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|otf|css|js)$',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ],
    },
  ],
};

export default nextConfig;
