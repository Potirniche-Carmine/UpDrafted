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
    small: { width: 48, height: 38, containerClass: "w-12 h-9" },
    medium: { width: 80, height: 64, containerClass: "w-20 h-16" },
    large: { width: 128, height: 102, containerClass: "w-32 h-24" }
  };
  
  const config = sizeConfig[size];
  
  if (hasError) {
    return (
      <div className={`${config.containerClass} flex items-center justify-center bg-muted rounded-lg border border-border/50 ${className}`}>
        <span className="text-xs text-muted-foreground text-center px-1">
          {organizationName.slice(0, 3).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`${config.containerClass} relative ${className}`}>
      <Image
        src={src}
        alt={`${organizationName} logo`}
        width={config.width}
        height={config.height}
        className="object-contain rounded-lg border border-border/50"
        priority={false}
        quality={80} // Optimal quality vs cost balance
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        sizes={`${config.width}px`} // Fixed size to ensure consistent cache key
        unoptimized={false}
        loading="lazy"
        onError={() => setHasError(true)}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
} 