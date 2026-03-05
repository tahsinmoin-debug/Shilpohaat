"use client";

import React from 'react';
import {
  isCloudinaryAssetUrl,
  toCloudinaryOptimizedUrl,
  toCloudinaryResponsiveSrcSet,
} from '@/lib/cloudinary-image';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  sizes?: string;
  widths?: number[];
  quality?: number | 'auto';
  crop?: 'fill' | 'fit' | 'limit' | 'pad' | 'scale';
};

export default function CloudinaryResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  widths,
  quality = 'auto',
  crop = 'fill',
  loading,
  ...rest
}: Props) {
  const shouldOptimize = !!src && (isCloudinaryAssetUrl(src) || src.startsWith('http://') || src.startsWith('https://'));

  if (!shouldOptimize) {
    return <img src={src} alt={alt} loading={loading || 'lazy'} {...rest} />;
  }

  const srcSet = toCloudinaryResponsiveSrcSet(src, { widths, quality, crop });
  const bestWidth = widths && widths.length ? Math.max(...widths) : undefined;
  const optimizedSrc = toCloudinaryOptimizedUrl(src, { width: bestWidth, quality, crop });

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={loading || 'lazy'}
      decoding="async"
      {...rest}
    />
  );
}
