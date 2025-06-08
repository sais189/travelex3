import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, AlertCircle } from "lucide-react";

interface RobustImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function RobustImage({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc,
  onLoad,
  onError 
}: RobustImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
      return;
    }
    
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center space-y-2 text-muted-foreground"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">Loading...</span>
          </motion.div>
        </motion.div>
      )}

      {hasError && !isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col items-center space-y-2 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm text-center px-4">Image unavailable</span>
          </div>
        </motion.div>
      )}

      <motion.img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading || hasError ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: isLoading || hasError ? 0 : 1,
          scale: 1
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}