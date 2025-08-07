'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  onLoad?: () => void;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  className,
  containerClassName,
  sizes,
  onLoad,
  fallback = '/images/placeholder.png',
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const imageSrc = error ? fallback : src;

  // Definir sizes baseado em breakpoints comuns se não fornecido
  const defaultSizes = fill
    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    : undefined;

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', containerClassName)}>
        {loading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={cn(
            'object-cover transition-opacity duration-300',
            loading ? 'opacity-0' : 'opacity-100',
            className
          )}
          sizes={sizes || defaultSizes}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative inline-block', containerClassName)}>
      {loading && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{ width, height }}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width || 500}
        height={height || 500}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Componente para avatar otimizado
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallback = '/images/default-avatar.png',
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallback?: string;
}) {
  return (
    <OptimizedImage
      src={src || fallback}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      containerClassName={cn('rounded-full overflow-hidden')}
      quality={90}
      priority={size > 60}
    />
  );
}

// Componente para imagem de background otimizada
export function OptimizedBackgroundImage({
  src,
  alt,
  children,
  className,
  overlayClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn('relative', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={85}
        className="object-cover"
        sizes="100vw"
      />
      {overlayClassName && (
        <div className={cn('absolute inset-0', overlayClassName)} />
      )}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}
