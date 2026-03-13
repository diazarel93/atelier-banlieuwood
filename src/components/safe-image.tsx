"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string | undefined | null;
  alt: string;
  fallbackEmoji?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  fill?: boolean;
  unoptimized?: boolean;
  sizes?: string;
  priority?: boolean;
}

/**
 * Image wrapper with fallback — displays a placeholder emoji
 * when the image fails to load (network error, TMDB down, etc.)
 * Uses next/image for optimization. Set unoptimized=true for AI-generated URLs.
 */
export function SafeImage({
  src,
  alt,
  fallbackEmoji = "🎬",
  className = "",
  style,
  width,
  height,
  fill,
  unoptimized,
  sizes,
  priority,
}: SafeImageProps) {
  const [failed, setFailed] = useState(!src);

  const handleError = useCallback(() => setFailed(true), []);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-bw-elevated text-2xl select-none ${className}`}
        style={style}
        role="img"
        aria-label={alt}
      >
        {fallbackEmoji}
      </div>
    );
  }

  // For external URLs without configured remotePatterns, use unoptimized
  const isExternal = src.startsWith("http");
  const shouldUnoptimize = unoptimized ?? (isExternal && src.includes("pollinations.ai"));

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      width={fill ? undefined : (width ?? 300)}
      height={fill ? undefined : (height ?? 200)}
      fill={fill}
      unoptimized={shouldUnoptimize}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  );
}
