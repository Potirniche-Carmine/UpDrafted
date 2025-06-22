import type { NextConfig } from "next";

// CORS configuration based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const allowedOrigins = isDevelopment 
  ? ['http://localhost:3000', 'http://127.0.0.1:3000']
  : ['https://updrafted.us', 'https://www.updrafted.us'];

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
      allowedOrigins: isDevelopment ? ['localhost:3000'] : ['updrafted.us', 'www.updrafted.us'],
    },
    // Minimize middleware processing
    middlewarePrefetch: 'flexible',
  },
  // Force static optimization where possible
  trailingSlash: false,
  compress: true,
  // Optimize headers with CORS and security
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
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        },
        // Add HSTS for HTTPS enforcement
        {
          key: 'Strict-Transport-Security',
          value: isDevelopment ? '' : 'max-age=31536000; includeSubDomains; preload'
        },
        // Add basic CSP
        {
          key: 'Content-Security-Policy',
          value: isDevelopment 
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;"
            : "default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.updrafted.us; img-src 'self' data: https: blob:; connect-src 'self' https:; font-src 'self' data:; style-src 'self' 'unsafe-inline';"
        }
      ],
    },
    // CORS headers for API routes - FIXED: No wildcard origins
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: allowedOrigins[0]
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS'
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization, X-Requested-With'
        },
        {
          key: 'Access-Control-Allow-Credentials',
          value: 'true'
        },
        {
          key: 'Access-Control-Max-Age',
          value: '86400' // 24 hours
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
