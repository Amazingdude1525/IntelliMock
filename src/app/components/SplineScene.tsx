import Spline from '@splinetool/react-spline';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SplineSceneProps {
  scene: string;
  className?: string;
}

import { ErrorBoundary } from './ErrorBoundary';

export function SplineScene({ scene, className = "" }: SplineSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fallback = (
    <div className={`relative w-full h-full min-h-[400px] flex items-center justify-center bg-black/20 rounded-xl border border-white/5 ${className}`}>
      <p className="text-text-muted font-mono text-sm uppercase tracking-widest text-center px-4">
         3D Engine Initializer Error<br />
         <span className="text-[10px] opacity-50 mt-2 block">Graphics Context Resetting...</span>
      </p>
    </div>
  );

  if (hasError) return fallback;

  return (
    <div className={`relative w-full h-full min-h-[400px] flex items-center justify-center ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <Loader2 className="w-10 h-10 text-accent-purple animate-spin mb-4" />
          <p className="text-text-muted font-mono text-sm animate-pulse">Initializing 3D Core...</p>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="w-full h-full"
      >
        <ErrorBoundary fallback={fallback}>
          <Spline 
            scene={scene} 
            onLoad={() => setIsLoading(false)}
            onError={() => {
              console.error("Spline Load Error:", scene);
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </ErrorBoundary>
      </motion.div>
    </div>
  );
}
