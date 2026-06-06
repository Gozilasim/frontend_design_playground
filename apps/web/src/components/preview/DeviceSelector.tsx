'use client';

import { useState, useRef, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, RotateCcw } from 'lucide-react';
import { viewportPresets, ViewportPreset } from '@/data/viewportPresets';
import { useDesignContext } from '@/providers/DesignProvider';
import { cn } from '@/lib/utils';

const deviceTypeIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  shorts: RotateCcw,
};

const deviceTypeLabels = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
  shorts: 'Shorts',
};

export function DeviceSelector() {
  const { viewport, dispatch } = useDesignContext();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPreset, setHoveredPreset] = useState<ViewportPreset | null>(null);
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

  const currentPreset = viewportPresets.find(
    (p) => p.width === viewport.width && p.height === viewport.height
  );

  const groupedPresets = viewportPresets.reduce(
    (acc, preset) => {
      if (!acc[preset.deviceType]) acc[preset.deviceType] = [];
      acc[preset.deviceType].push(preset);
      return acc;
    },
    {} as Record<string, ViewportPreset[]>
  );

  const CurrentIcon = currentPreset ? deviceTypeIcons[currentPreset.deviceType] : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-1.5',
          'text-muted-foreground text-sm font-medium hover:text-foreground',
          'transition-colors hover:bg-accent',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select device viewport"
      >
        {currentPreset && CurrentIcon && (
          <>
            <CurrentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{deviceTypeLabels[currentPreset.deviceType]}</span>
            <span className="text-muted-foreground hidden w-24 text-right md:inline-block">
              {currentPreset.width}×{currentPreset.height}
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 w-56 origin-top-right animate-scale-in rounded-lg border border-border bg-popover p-2 shadow-lg"
          role="listbox"
          aria-label="Viewport presets"
        >
          {Object.entries(groupedPresets).map(([deviceType, presets]) => (
            <div key={deviceType} className="py-1">
              <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold uppercase tracking-wider">
                {deviceTypeLabels[deviceType as keyof typeof deviceTypeLabels]}
              </div>
              {presets.map((preset) => {
                const PresetIcon = deviceTypeIcons[preset.deviceType];
                return (
                  <button
                    key={`${preset.width}x${preset.height}`}
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_VIEWPORT', payload: preset });
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHoveredPreset(preset)}
                    onMouseLeave={() => setHoveredPreset(null)}
                    role="option"
                    aria-selected={
                      viewport.width === preset.width && viewport.height === preset.height
                    }
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5',
                      'text-muted-foreground text-sm hover:text-foreground',
                      'transition-colors hover:bg-accent',
                      'focus:outline-none focus:ring-2 focus:ring-ring',
                      viewport.width === preset.width && viewport.height === preset.height
                        ? 'bg-accent font-medium text-foreground'
                        : ''
                    )}
                  >
                    <PresetIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{preset.label}</span>
                    {viewport.width === preset.width && viewport.height === preset.height && (
                      <span className="text-primary">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
