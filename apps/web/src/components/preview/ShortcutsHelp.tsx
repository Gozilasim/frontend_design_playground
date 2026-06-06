'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: 'F', description: 'Toggle fullscreen' },
  { key: 'D', description: 'Cycle device presets' },
  { key: 'B', description: 'Cycle backgrounds' },
  { key: '← / →', description: 'Previous / Next design in category' },
  { key: 'Space', description: 'Pause/resume animations' },
  { key: 'S', description: 'Toggle sidebar' },
  { key: '+ / -', description: 'Zoom in / out' },
  { key: '0', description: 'Reset zoom to 100%' },
  { key: 'Esc', description: 'Exit fullscreen' },
  { key: '?', description: 'Show this help' },
];

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === '?' && event.shiftKey) {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="relative mx-4 w-full max-w-md animate-scale-in rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="flex items-center gap-2 text-lg font-semibold">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground rounded-lg p-1 transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close shortcuts help"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="max-h-80 space-y-3 overflow-y-auto">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="border-border/50 flex items-center justify-between border-b py-2 last:border-0"
            >
              <dt className="text-muted-foreground text-sm">{shortcut.description}</dt>
              <dd className="font-mono">
                <kbd
                  className={cn(
                    'rounded border border-border bg-muted px-2.5 py-1',
                    'text-sm font-medium text-foreground',
                    'shadow-sm'
                  )}
                >
                  {shortcut.key}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
