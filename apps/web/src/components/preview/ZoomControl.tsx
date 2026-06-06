'use client';

import { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Maximize2, Minimize2 } from 'lucide-react';
import { useDesignContext } from '@/providers/DesignProvider';
import { cn } from '@/lib/utils';

export function ZoomControl() {
  const { zoomLevel, dispatch } = useDesignContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const zoomPresets = [25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];

  const handleZoomChange = (level: number) => {
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: level });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const value = parseInt(event.currentTarget.value, 10);
      if (!isNaN(value) && value >= 25 && value <= 200) {
        handleZoomChange(value);
      }
      (event.currentTarget as HTMLInputElement).blur();
    } else if (event.key === 'Escape') {
      (event.currentTarget as HTMLInputElement).blur();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-1.5',
          'text-muted-foreground font-mono text-sm hover:text-foreground',
          'transition-colors hover:bg-accent',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Zoom control"
      >
        <Minimize2 className="h-4 w-4" />
        <span className="w-16 text-right">{zoomLevel}%</span>
        <Plus className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 w-48 origin-top-right animate-scale-in rounded-lg border border-border bg-popover p-3 shadow-lg"
          role="listbox"
          aria-label="Zoom presets"
        >
          <div className="mb-2">
            <label htmlFor="zoom-input" className="sr-only">
              Zoom level
            </label>
            <input
              id="zoom-input"
              type="number"
              min="25"
              max="200"
              step="1"
              value={zoomLevel}
              onChange={(e) => handleZoomChange(parseInt(e.target.value, 10))}
              onKeyDown={handleKeyDown}
              onBlur={() => setIsOpen(false)}
              autoFocus
              className="bg-input w-full rounded-lg border border-border px-3 py-1.5 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Custom zoom percentage"
            />
          </div>

          <div className="grid max-h-40 grid-cols-5 gap-1 overflow-y-auto">
            {zoomPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  handleZoomChange(preset);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={zoomLevel === preset}
                className={cn(
                  'rounded px-2 py-1.5 font-mono text-sm',
                  'text-muted-foreground hover:bg-accent hover:text-foreground',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                  zoomLevel === preset && 'bg-accent font-medium text-foreground'
                )}
              >
                {preset}%
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                handleZoomChange(Math.max(25, zoomLevel - 10));
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Minus className="h-4 w-4" />
              <span>-10%</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleZoomChange(100);
                setIsOpen(false);
              }}
              className="text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-sm font-medium transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
              <span>100%</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleZoomChange(Math.min(200, zoomLevel + 10));
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <span>+10%</span>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
