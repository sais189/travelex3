import { useState, useEffect } from "react";

export function useImagePreload(sources: string[]): boolean {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = sources.length;

    if (totalImages === 0) {
      setImagesLoaded(true);
      return;
    }

    const imagePromises = sources.map(src => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.allSettled(imagePromises);
  }, [sources]);

  return imagesLoaded;
}