import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Globe3D() {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Since we can't use actual Three.js in this setup, we'll create a CSS-based 3D globe effect
    const globe = globeRef.current;
    if (!globe) return;

    // Add floating animation markers
    const createFloatingMarker = (delay: number, color: string) => {
      const marker = document.createElement("div");
      marker.className = `absolute w-3 h-3 rounded-full ${color} opacity-80 animate-pulse`;
      marker.style.animationDelay = `${delay}s`;
      return marker;
    };

    // Create animated markers around the globe
    const markers = [
      { delay: 0, color: "bg-gold-accent", top: "20%", right: "10%" },
      { delay: 1, color: "bg-lavender-accent", bottom: "25%", left: "15%" },
      { delay: 2, color: "bg-mint-accent", top: "50%", right: "5%" },
    ];

    markers.forEach(({ delay, color, ...position }) => {
      const marker = createFloatingMarker(delay, color);
      Object.assign(marker.style, position);
      globe.appendChild(marker);
    });

    return () => {
      if (globe) {
        globe.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="relative w-96 h-96 mx-auto">
      <motion.div
        ref={globeRef}
        className="relative w-full h-full"
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Globe Image with Enhanced Styling */}
        <div 
          className="w-full h-full rounded-full shadow-2xl border-4 border-gold-accent bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(136, 132, 255, 0.2) 0%, transparent 40%),
              conic-gradient(from 0deg at 50% 50%, 
                #1e3a8a 0deg, 
                #1e40af 60deg, 
                #1d4ed8 120deg, 
                #2563eb 180deg, 
                #3b82f6 240deg, 
                #1e3a8a 300deg, 
                #1e3a8a 360deg)
            `,
            filter: "hue-rotate(45deg) saturate(1.2) brightness(1.1)",
          }}
        >
          {/* Continents overlay */}
          <div className="absolute inset-0 rounded-full opacity-60">
            <div className="absolute top-1/4 left-1/3 w-16 h-12 bg-green-600 rounded-full opacity-40 transform rotate-12"></div>
            <div className="absolute top-1/2 right-1/4 w-20 h-8 bg-green-500 rounded-full opacity-40 transform -rotate-6"></div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-16 bg-green-700 rounded-full opacity-40 transform rotate-45"></div>
          </div>
        </div>

        {/* Floating Travel Icons */}
        <motion.div
          className="absolute top-10 -right-4"
          animate={{
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-8 h-8 bg-gold-accent rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
            </svg>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 -left-4"
          animate={{
            y: [-15, 15, -15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <div className="w-8 h-8 bg-lavender-accent rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-2 7.87V16a1 1 0 102 0v-3.13A4 4 0 0011 5z" clipRule="evenodd"/>
            </svg>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-1/2 -right-8"
          animate={{
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <div className="w-8 h-8 bg-mint-accent rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
