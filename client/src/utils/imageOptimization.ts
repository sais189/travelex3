// Image optimization utilities for better performance

interface ImageOptimOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

export function optimizeImageUrl(url: string, options: ImageOptimOptions = {}): string {
  const { width = 800, height = 600, quality = 75, format = 'jpg' } = options;
  
  // For Unsplash images, add optimization parameters
  if (url.includes('images.unsplash.com')) {
    const optimizedUrl = new URL(url);
    optimizedUrl.searchParams.set('w', width.toString());
    optimizedUrl.searchParams.set('h', height.toString());
    optimizedUrl.searchParams.set('q', quality.toString());
    optimizedUrl.searchParams.set('fm', format);
    optimizedUrl.searchParams.set('fit', 'crop');
    return optimizedUrl.toString();
  }
  
  return url;
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function generateWebPUrl(originalUrl: string): string {
  if (originalUrl.includes('unsplash.com')) {
    const url = new URL(originalUrl);
    url.searchParams.set('fm', 'webp');
    return url.toString();
  }
  return originalUrl;
}