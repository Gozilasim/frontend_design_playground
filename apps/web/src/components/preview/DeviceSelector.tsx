'use client';

import { useState, useRef, useEffect, type ComponentType } from 'react';
import { Monitor, Smartphone, Tablet, RotateCcw } from 'lucide-react';
import { viewportPresets, type ViewportPreset } from '@/data/viewportPresets';
import { useDesignContext } from '@/providers/DesignProvider';
import { DropdownPortal } from '@/components/ui/DropdownPortal';
import { cn } from '@/lib/utils';

const deviceTypeIcons: Record<
  ViewportPreset['deviceType'],
  ComponentType<{ className?: string }>
> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  shorts: RotateCcw,
};

const deviceTypeLabels: Record<ViewportPreset['deviceType'], string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
  shorts: 'Shorts',
};

const deviceTypeOrder: ViewportPreset['deviceType'][] = ['desktop', 'mobile', 'tablet', 'shorts'];

export function DeviceSelector() {
  const { viewport, dispatch } = useDesignContext();
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

  const currentPreset = viewportPresets.find(
    (p) => p.width === viewport.width && p.height === viewport.height
  );

  const groupedPresets = viewportPresets.reduce<
    Record<ViewportPreset['deviceType'], ViewportPreset[]>
  >(
    (acc, preset) => {
      acc[preset.deviceType].push(preset);
      return acc;
    },
    {
      desktop: [],
      mobile: [],
      tablet: [],
      shorts: [],
    }
  );

  const CurrentIcon = currentPreset ? deviceTypeIcons[currentPreset.deviceType] : null;

  return (
    <div>
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

      <DropdownPortal
        ref={dropdownRef}
        buttonRef={buttonRef}
        isOpen={isOpen}
        className="w-56 p-2"
        role="listbox"
        aria-label="Viewport presets"
      >
        {deviceTypeOrder.map((deviceType) => {
          const presets = groupedPresets[deviceType];
          if (presets.length === 0) return null;

          return (
            <div key={deviceType} className="py-1">
              <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold uppercase tracking-wider">
                {deviceTypeLabels[deviceType]}
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
          );
        })}
      </DropdownPortal>
    </div>
  );
}
