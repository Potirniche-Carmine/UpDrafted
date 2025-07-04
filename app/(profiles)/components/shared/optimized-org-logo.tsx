"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedOrgLogoProps {
  src: string;
  organizationName: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Cost-optimized organization logo component for Vercel Image Optimization
 * 
 * Key optimizations:
 * - Fixed sizes to maximize cache hits (80px standard)
 * - Quality 80 (good balance of quality vs file size)
 * - 1-year cache TTL for rarely changing logos
 * - Lazy loading for performance
 * - Consistent cache keys to minimize transformations
 * - Fixed container sizes to prevent layout shifts
 */
export function OptimizedOrgLogo({ 
  src, 
  organizationName, 
  className = "",
  size = 'medium'
}: OptimizedOrgLogoProps) {
  const [hasError, setHasError] = useState(false);
  
  // Fixed sizes to ensure consistent cache keys and minimize transformations
  const sizeConfig = {
    small: { width: 48, height: 48, containerClass: "w-12 h-12" },
    medium: { width: 80, height: 80, containerClass: "w-20 h-20" },
    large: { width: 128, height: 128, containerClass: "w-32 h-32" }
  };
  
  const config = sizeConfig[size];
  
  // Add cache-busting parameter only if the URL doesn't already have one
  const imageUrl = src.includes('?') ? src : `${src}?v=1`;
  
  if (hasError) {
    return (
      <div className={`${config.containerClass} flex items-center justify-center bg-muted rounded-lg border border-border/50 flex-shrink-0 ${className}`}>
        <span className="text-xs text-muted-foreground text-center px-1">
          {organizationName.slice(0, 3).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`${config.containerClass} relative flex-shrink-0 ${className}`}>
      <Image
        src={imageUrl}
        alt={`${organizationName} logo`}
        width={config.width}
        height={config.height}
        className="object-cover rounded-lg border border-border/50 w-full h-full"
        priority={false}
        quality={80} // Optimal quality vs cost balance
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        sizes={`${config.width}px`} // Fixed size to ensure consistent cache key
        unoptimized={false}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
} 