// Resource preloader for critical assets
class ResourcePreloader {
  private preloadedImages = new Set<string>();
  private preloadedFonts = new Set<string>();
  
  // Preload critical images
  preloadImage(src: string): Promise<void> {
    if (this.preloadedImages.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Preload multiple images concurrently
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url));
    await Promise.allSettled(promises);
  }

  // Preload fonts
  preloadFont(fontFamily: string, url: string): Promise<void> {
    if (this.preloadedFonts.has(fontFamily)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const font = new FontFace(fontFamily, `url(${url})`);
      font.load()
        .then(() => {
          document.fonts.add(font);
          this.preloadedFonts.add(fontFamily);
          resolve();
        })
        .catch(reject);
    });
  }

  // Preload critical resources for homepage
  async preloadCriticalResources(): Promise<void> {
    const criticalImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75',
      'https://images.unsplash.com/photo-1539704892725-de45bc5b63c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75'
    ];

    await this.preloadImages(criticalImages);
  }

  // Add DNS prefetch for external domains
  addDNSPrefetch(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  // Add resource hints
  addResourceHints(): void {
    // DNS prefetch for image CDNs
    this.addDNSPrefetch(['images.unsplash.com', 'cdn.jsdelivr.net']);

    // Preconnect to critical origins
    const preconnectDomains = ['images.unsplash.com'];
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

export const preloader = new ResourcePreloader();

// Initialize resource hints immediately
if (typeof window !== 'undefined') {
  preloader.addResourceHints();
}