'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Image, Grid, Minimize2, Maximize2 } from 'lucide-react';
import { useDesignContext } from '@/providers/DesignProvider';
import { BackgroundConfig } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

const backgroundPresets: BackgroundConfig[] = [
  { type: 'solid', value: '#0a0a0a' },
  { type: 'solid', value: '#1a1a2e' },
  { type: 'solid', value: '#16213e' },
  { type: 'solid', value: '#0f0f23' },
  { type: 'solid', value: '#ffffff' },
  { type: 'solid', value: '#fafafa' },
  { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { type: 'gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { type: 'grid', value: '20' },
  { type: 'grid', value: '40' },
];

export function BackgroundControl() {
  const { background, dispatch } = useDesignContext();
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#0a0a0a');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePresetSelect = (preset: BackgroundConfig) => {
    dispatch({ type: 'SET_BACKGROUND', payload: preset });
    setIsOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newBg: BackgroundConfig = { type: 'image', value: url };
      dispatch({ type: 'SET_BACKGROUND', payload: newBg });
      setIsOpen(false);
    }
  };

  const getBackgroundStyle = (bg: BackgroundConfig): React.CSSProperties => {
    switch (bg.type) {
      case 'solid':
        return { backgroundColor: bg.value };
      case 'gradient':
        return { backgroundImage: bg.value };
      case 'grid':
        const size = parseInt(bg.value, 10);
        return {
          backgroundImage: `
            linear-gradient(rgba(128,128,128,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,128,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
        };
      case 'image':
        return {
          backgroundImage: `url(${bg.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      default:
        return {};
    }
  };

  const currentStyle = getBackgroundStyle(background);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative h-9 w-9 rounded-lg border border-border',
          'transition-colors hover:bg-accent',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Background settings"
        style={currentStyle}
      >
        <Palette className="text-muted-foreground h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 w-64 origin-top-right animate-scale-in rounded-lg border border-border bg-popover p-3 shadow-lg"
          role="listbox"
          aria-label="Background presets"
        >
          <div className="mb-3 flex items-center gap-2">
            <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  dispatch({
                    type: 'SET_BACKGROUND',
                    payload: { type: 'solid', value: e.target.value },
                  });
                }}
                className="h-6 w-6 cursor-pointer rounded border border-border"
                aria-label="Custom color"
              />
              <span>Custom</span>
            </label>
            <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-4 w-4" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
                aria-label="Upload background image"
              />
              <span>Image</span>
            </label>
          </div>

          <div className="grid max-h-60 grid-cols-4 gap-1.5 overflow-y-auto">
            {backgroundPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                role="option"
                aria-selected={background.type === preset.type && background.value === preset.value}
                className={cn(
                  'relative aspect-square rounded border-2 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  background.type === preset.type && background.value === preset.value
                    ? 'scale-105 border-primary'
                    : 'border-transparent hover:border-border'
                )}
                style={getBackgroundStyle(preset)}
              >
                {background.type === preset.type && background.value === preset.value && (
                  <Maximize2 className="absolute inset-0 flex h-4 w-4 items-center justify-center text-white/90" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'SET_BACKGROUND', payload: { type: 'solid', value: '#0a0a0a' } });
                setIsOpen(false);
              }}
              className="text-muted-foreground flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-foreground"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Reset to default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
