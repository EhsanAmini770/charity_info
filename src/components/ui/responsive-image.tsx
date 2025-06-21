import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  sizes?: string;
  widths?: number[];
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage component with WebP support and responsive sizing
 */
export function ResponsiveImage({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  sizes = '100vw',
  widths = [640, 750, 828, 1080, 1200, 1920],
  aspectRatio = 'aspect-square',
  objectFit = 'cover',
  priority = false,
  className,
  imgClassName,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate srcset for WebP format
  const generateSrcSet = (format: 'webp' | 'original') => {
    if (hasError) return '';

    // For external URLs or SVGs, don't generate srcset
    if (src.startsWith('http') || src.endsWith('.svg')) {
      return src;
    }

    // Extract base URL and extension
    const extension = src.split('.').pop() || 'jpg';
    const baseSrc = src.substring(0, src.lastIndexOf('.'));

    return widths
      .map(width => {
        const newSrc = format === 'webp'
          ? `${baseSrc}-${width}.webp ${width}w`
          : `${baseSrc}-${width}.${extension} ${width}w`;
        return newSrc;
      })
      .join(', ');
  };

  // Determine the source URL
  const imageUrl = hasError ? fallbackSrc : src;

  return (
    <div className={cn(
      aspectRatio,
      'relative overflow-hidden bg-muted',
      className
    )}>
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      <picture>
        {/* WebP source */}
        <source
          type="image/webp"
          srcSet={generateSrcSet('webp')}
          sizes={sizes}
        />
        
        {/* Original format source */}
        <source
          srcSet={generateSrcSet('original')}
          sizes={sizes}
        />
        
        {/* Fallback image */}
        <img
          src={imageUrl}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'h-full w-full transition-opacity duration-300',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
            isLoaded ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
        />
      </picture>
    </div>
  );
}
