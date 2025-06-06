import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, RefreshCw } from 'lucide-react';

interface RobustImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  onLoad?: () => void;
  onError?: () => void;
  retryable?: boolean;
}

export function RobustImage({
  src,
  alt,
  className = "",
  fallbackTitle,
  fallbackSubtitle,
  onLoad,
  onError,
  retryable = true
}: RobustImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const maxRetries = 2;

  // Backup image sources with better reliability
  const getBackupImageSources = (originalSrc: string): string[] => {
    const backups: string[] = [];
    
    // If it's an Unsplash URL, try different quality parameters
    if (originalSrc.includes('unsplash.com')) {
      const baseUrl = originalSrc.split('?')[0];
      backups.push(`${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`);
      backups.push(`${baseUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=75`);
      backups.push(`${baseUrl}?w=600&q=70`);
    }
    
    // Add generic travel-related backup images
    backups.push('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'); // Travel
    backups.push('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'); // Nature
    backups.push('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'); // Landscape
    
    return backups;
  };

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    if (retryCount < maxRetries && retryable) {
      const backupSources = getBackupImageSources(src);
      if (retryCount < backupSources.length) {
        setCurrentSrc(backupSources[retryCount]);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
    
    setImageState('error');
    onError?.();
  };

  const retryLoad = () => {
    setImageState('loading');
    setRetryCount(0);
    setCurrentSrc(src);
  };

  useEffect(() => {
    setCurrentSrc(src);
    setImageState('loading');
    setRetryCount(0);
  }, [src]);

  if (imageState === 'error') {
    return (
      <div className={`bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center text-center p-8 ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gold-accent/20 to-lavender-accent/20 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gold-accent" />
          </div>
          
          {fallbackTitle && (
            <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              {fallbackTitle}
            </h4>
          )}
          
          {fallbackSubtitle && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {fallbackSubtitle}
            </p>
          )}
          
          {retryable && (
            <motion.button
              onClick={retryLoad}
              className="inline-flex items-center px-4 py-2 bg-gold-accent/10 hover:bg-gold-accent/20 rounded-full text-gold-accent font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-3 border-gold-accent/30 border-t-gold-accent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}