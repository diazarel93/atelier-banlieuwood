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
 * Image wrapper with graceful loading + error fallback.
 *
 * Features:
 * - Shimmer placeholder while loading
 * - Smooth fade-in on load (respects prefers-reduced-motion)
 * - Emoji fallback on error
 * - Auto-detects pollinations.ai URLs as unoptimized
 * - Accessible: role="img" + aria-label on fallback
 */
export function SafeImage({
  src,
  alt,
  fallbackEmoji = "\uD83C\uDFAC",
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
  const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(() => setFailed(true), []);
  const handleLoad = useCallback(() => setLoaded(true), []);

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

  const isExternal = src.startsWith("http");
  const shouldUnoptimize = unoptimized ?? (isExternal && src.includes("pollinations.ai"));

  return (
    <span className="relative inline-block" style={fill ? { display: "block", width: "100%", height: "100%" } : undefined}>
      {/* Shimmer placeholder — visible until image loads */}
      {!loaded && (
        <span
          className={`absolute inset-0 motion-safe:animate-pulse rounded-xl bg-bw-surface-dim/40 ${className}`}
          style={style}
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 motion-reduce:transition-none`}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
        }}
        onError={handleError}
        onLoad={handleLoad}
        width={fill ? undefined : (width ?? 300)}
        height={fill ? undefined : (height ?? 200)}
        fill={fill}
        unoptimized={shouldUnoptimize}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    </span>
  );
}
