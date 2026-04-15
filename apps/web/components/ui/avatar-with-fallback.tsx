"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarWithFallbackProps {
    src?: string | null;
    alt?: string;
    name?: string | null;
    email?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    fallbackClassName?: string;
    imageClassName?: string;
}

const sizeMap = {
    xs: { container: 'w-6 h-6', text: 'text-[10px]' },
    sm: { container: 'w-9 h-9', text: 'text-sm' },
    md: { container: 'w-12 h-12', text: 'text-base' },
    lg: { container: 'w-16 h-16', text: 'text-xl' },
    xl: { container: 'w-24 h-24', text: 'text-3xl' },
};

/**
 * Avatar component with automatic fallback to initials
 * Shows user's first and last name initials in a modern, styled container
 */
export function AvatarWithFallback({
    src,
    alt,
    name,
    email,
    size = 'md',
    className = '',
    fallbackClassName = '',
    imageClassName = '',
}: AvatarWithFallbackProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Generate initials from name or email
    const getInitials = () => {
        if (name) {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                // First name initial + Last name initial
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            // Single name - use first two characters
            return name.substring(0, 2).toUpperCase();
        }
        if (email) {
            // Use first two characters of email
            return email.substring(0, 2).toUpperCase();
        }
        return '??';
    };

    // Generate a consistent color based on the name/email
    const getBackgroundColor = () => {
        const text = name || email || '';
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate a pleasant color from the hash
        const hue = Math.abs(hash % 360);
        // Use high saturation and medium-high lightness for vibrant but readable colors
        return `hsl(${hue}, 65%, 55%)`;
    };

    const sizes = sizeMap[size];
    const shouldShowImage = src && !imageError;

    return (
        <div
            className={cn(
                'relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0',
                sizes.container,
                className
            )}
            style={!shouldShowImage ? { backgroundColor: getBackgroundColor() } : undefined}
        >
            {shouldShowImage ? (
                <>
                    <Image
                        src={src}
                        alt={alt || name || 'User avatar'}
                        fill
                        className={cn(
                            'object-cover transition-opacity duration-300',
                            imageLoaded ? 'opacity-100' : 'opacity-0',
                            imageClassName
                        )}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(false);
                        }}
                        onLoad={() => setImageLoaded(true)}
                        unoptimized
                    />
                    {/* Show initials while loading */}
                    {!imageLoaded && (
                        <div
                            className={cn(
                                'absolute inset-0 flex items-center justify-center font-semibold text-white',
                                sizes.text,
                                fallbackClassName
                            )}
                        >
                            {getInitials()}
                        </div>
                    )}
                </>
            ) : (
                <div
                    className={cn(
                        'flex items-center justify-center font-semibold text-white w-full h-full',
                        sizes.text,
                        fallbackClassName
                    )}
                >
                    {getInitials()}
                </div>
            )}
        </div>
    );
}
