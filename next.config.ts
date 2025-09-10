import type { NextConfig } from "next";
import withPWA from 'next-pwa';

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
        pathname: '/updrafted-logo.png',
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
      {
        pathname: '/icons/**',
        search: '',
      },
      {
        pathname: '/hero/**',
        search: '',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bucket.updrafted.us',
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
    qualities: [25, 50, 70, 75, 90, 100],
    loader: 'default',
  },
  
  // Redirects for SEO and proper canonicalization
  redirects: async () => [
    // Redirect www to non-www
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.updrafted.us',
        },
      ],
      destination: 'https://updrafted.us/:path*',
      permanent: true,
    },
    // Redirect HTTP to HTTPS for non-www
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'updrafted.us',
        },
        {
          type: 'header',
          key: 'x-forwarded-proto',
          value: 'http',
        },
      ],
      destination: 'https://updrafted.us/:path*',
      permanent: true,
    },
  ],

  // Additional optimizations for cost efficiency
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Optimize for Node.js runtime where possible
    serverActions: {
      allowedOrigins: ['localhost:3000', 'updrafted.us'],
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
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        },
        {
          key: 'Content-Security-Policy',
          value: 'upgrade-insecure-requests'
        }
      ],
    },
    // CORS headers for API routes
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: allowedOrigins.join(',')
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

const pwaConfig = withPWA({
  dest: 'public',
  disable: isDevelopment,
  register: true,
  skipWaiting: true,
  // Include our custom icons in the precache
  additionalManifestEntries: [
    { url: '/icons/favicon-16x16.png', revision: null },
    { url: '/icons/favicon-32x32.png', revision: null },
    { url: '/icons/icon-192x192.png', revision: null },
    { url: '/icons/icon-384x384.png', revision: null },
    { url: '/icons/icon-512x512.png', revision: null },
    { url: '/site.webmanifest', revision: null }
  ],
  runtimeCaching: [
    // API Routes - Different strategies based on data type
    {
      urlPattern: /^.*\/api\/messages.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-messages',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^.*\/api\/notifications.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-notifications',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 15 * 60, // 15 minutes
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^.*\/api\/profile.*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-profiles',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // All other API calls
    {
      urlPattern: /^.*\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-other',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Static assets
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // External resources - conservative caching strategy
    {
      urlPattern: /^https?.*/, 
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'external-resources',
        expiration: {
          maxEntries: 100, // Increased capacity
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: { statuses: [0, 200, 206] }, // Added 206 for partial content
        plugins: [{
          cacheWillUpdate: async ({ response }) => {
            // Only cache successful responses and avoid caching error pages
            return response.status === 200 ? response : null;
          }
        }]
      },
    },
  ],
});

// Type assertion needed for Next.js 15 compatibility with next-pwa
const nextConfigWithPWA = pwaConfig(nextConfig as Parameters<typeof withPWA>[0]);

export default nextConfigWithPWA;