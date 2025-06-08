// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  // Mark performance measurement points
  mark(name: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
    this.metrics.set(name, Date.now());
  }

  // Measure performance between two marks
  measure(name: string, startMark: string, endMark?: string): number | null {
    try {
      if ('performance' in window && performance.measure) {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        
        const entries = performance.getEntriesByName(name, 'measure');
        return entries.length > 0 ? entries[entries.length - 1].duration : null;
      }
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
    
    const startTime = this.metrics.get(startMark);
    const endTime = endMark ? this.metrics.get(endMark) : Date.now();
    
    if (startTime && endTime) {
      return endTime - startTime;
    }
    
    return null;
  }

  // Monitor Core Web Vitals
  observeWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime);
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              const fid = entry.processingStart - entry.startTime;
              console.log('FID:', fid);
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          if (clsValue > 0) {
            console.log('CLS:', clsValue);
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Web Vitals monitoring failed:', error);
      }
    }
  }

  // Optimize images loading
  optimizeImageLoading(): void {
    // Implement native lazy loading for modern browsers
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img) => {
        (img as HTMLImageElement).src = (img as HTMLImageElement).dataset.src || '';
        img.removeAttribute('data-src');
      });
    }
  }

  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttle function for performance
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Get connection quality
  getConnectionQuality(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      if (connection.effectiveType) {
        return connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
      }
      
      if (connection.downlink !== undefined) {
        if (connection.downlink >= 10) return '4g';
        if (connection.downlink >= 1.5) return '3g';
        if (connection.downlink >= 0.6) return '2g';
        return 'slow-2g';
      }
    }
    
    return 'unknown';
  }

  // Initialize performance monitoring
  init(): void {
    this.mark('app-start');
    this.observeWebVitals();
    this.optimizeImageLoading();
    
    // Log performance metrics when page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.mark('app-loaded');
        const loadTime = this.measure('app-load-time', 'app-start', 'app-loaded');
        console.log('App load time:', loadTime, 'ms');
        
        // Log navigation timing
        if (performance.getEntriesByType) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            console.log('Navigation timing:', {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
              loadComplete: navigation.loadEventEnd - navigation.navigationStart,
              firstByte: navigation.responseStart - navigation.navigationStart,
            });
          }
        }
      }, 0);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();