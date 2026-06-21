'use client'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
}

export function OptimizedImage({ src, alt, className = '', fallback = '/assets/items/default.png' }: OptimizedImageProps) {
  const [errored, setErrored] = useState(false)

  return (
    <img
      src={errored ? fallback : src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
    />
  )
}
