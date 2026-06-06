'use client';

import { useDesignContext } from '@/providers/DesignProvider';
import { DeviceFrame } from '../preview/DeviceFrame';
import { DeviceSelector } from '../preview/DeviceSelector';
import { BackgroundControl } from '../preview/BackgroundControl';
import { ZoomControl } from '../preview/ZoomControl';
import { FullscreenToggle } from '../preview/FullscreenToggle';
import { DesignCanvas } from '../preview/DesignCanvas';
import { ShortcutsHelp } from '../preview/ShortcutsHelp';
import { cn } from '@/lib/utils';

export function PreviewShell() {
  const { isFullscreen, viewport, background, sidebarOpen } = useDesignContext();

  return (
    <main
      className={cn(
        'flex flex-1 flex-col overflow-hidden',
        'bg-background transition-all duration-300',
        sidebarOpen ? 'lg:ml-72' : 'lg:ml-16'
      )}
      role="main"
    >
      {!isFullscreen && (
        <header className="bg-card/80 sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border px-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <DeviceSelector />
            <ZoomControl />
            <BackgroundControl />
          </div>
          <div className="flex items-center gap-2">
            <FullscreenToggle />
          </div>
        </header>
      )}

      <div
        className={cn(
          'flex flex-1 items-center justify-center overflow-auto p-4',
          isFullscreen && 'p-0'
        )}
      >
        <DeviceFrame>
          <DesignCanvas />
        </DeviceFrame>
      </div>

      <ShortcutsHelp />
    </main>
  );
}
