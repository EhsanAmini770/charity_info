import { useEffect } from 'react';

/**
 * Component to preload critical resources
 * This helps improve performance by loading important assets before they're needed
 */
export function Preload() {
  useEffect(() => {
    // Preload critical images
    const preloadImages = [
      '/placeholder.svg',
      // Add other critical images here
    ];

    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Preload critical routes
    const preloadRoutes = [
      '/news',
      '/gallery',
      '/faq',
    ];

    // Use requestIdleCallback to preload routes when browser is idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        preloadRoutes.forEach(route => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          document.head.appendChild(link);
        });
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}

export default Preload;
