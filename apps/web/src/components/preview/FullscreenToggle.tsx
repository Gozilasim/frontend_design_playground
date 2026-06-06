'use client';

import { useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useFullscreen } from '@/providers/DesignProvider';
import { cn } from '@/lib/utils';

export function FullscreenToggle() {
  const { isFullscreen, toggle, set } = useFullscreen();

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement && isFullscreen) {
        set(false);
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, set]);

  const handleClick = async () => {
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        toggle();
      } catch {
        toggle();
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore
      }
      set(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'rounded-lg p-2',
        'text-muted-foreground hover:bg-accent hover:text-foreground',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring'
      )}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={isFullscreen}
    >
      {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
    </button>
  );
}
