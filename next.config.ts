import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Additional optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  }
};

export default nextConfig;
