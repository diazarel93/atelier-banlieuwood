"use client";

import { useState, useCallback } from "react";

interface SafeImageProps {
  src: string | undefined | null;
  alt: string;
  fallbackEmoji?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Image wrapper with fallback — displays a placeholder emoji/initials
 * when the image fails to load (network error, TMDB down, etc.)
 */
export function SafeImage({ src, alt, fallbackEmoji = "🎬", className = "", style }: SafeImageProps) {
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

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  );
}
