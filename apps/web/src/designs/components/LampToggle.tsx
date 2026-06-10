'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

// Pull distance threshold and constraints
const PULL_THRESHOLD = 50;
const MAX_PULL = 70;
const CHAIN_REST_LENGTH = 44;

export default function LampToggle({ isFullscreen }: DesignProps) {
  const [isOn, setIsOn] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [chainSwing, setChainSwing] = useState(0);

  const chainHandleRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Produce a satisfying click sound via Web Audio API
  const playClickSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.08);
    } catch {
      // Silent fallback if Web Audio API is not available
    }
  }, []);

  // Pointer event handlers for the pull chain drag interaction
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setHasTriggered(false);
    dragStartY.current = e.clientY;
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = Math.max(0, e.clientY - dragStartY.current);
      const clamped = Math.min(delta, MAX_PULL);
      setPullDistance(clamped);

      // Trigger toggle when threshold is crossed (once per drag)
      if (clamped >= PULL_THRESHOLD && !hasTriggered) {
        setHasTriggered(true);
        playClickSound();
        setIsOn((prev) => !prev);
      }
    },
    [isDragging, hasTriggered, playClickSound]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setHasTriggered(false);
    // Animate chain spring-back
    setPullDistance(0);
    // Trigger a brief swing animation on release
    setChainSwing(1);
    setTimeout(() => setChainSwing(0), 500);
  }, []);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Current chain length is the rest length + the pulled distance
  const chainLength = CHAIN_REST_LENGTH + pullDistance;

  return (
    <div
      className={cn(
        'relative flex h-full w-full select-none items-center justify-center overflow-hidden',
        'transition-colors duration-700 ease-in-out'
      )}
      style={{
        backgroundColor: isOn ? '#F8F6F1' : '#0C0A14',
      }}
    >
      {/* Ambient background texture */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: isOn ? 0.4 : 0.15,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isOn ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'} 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Light cone glow - only visible when lamp is on */}
      <div
        className="pointer-events-none absolute transition-all duration-700 ease-in-out"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isOn ? '500px' : '0px',
          height: isOn ? '600px' : '0px',
          opacity: isOn ? 1 : 0,
          background: `conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(255, 220, 120, 0.08) 40%, rgba(255, 200, 80, 0.15) 50%, rgba(255, 220, 120, 0.08) 60%, transparent 70%)`,
          borderRadius: '0 0 50% 50%',
          filter: 'blur(20px)',
        }}
      />

      {/* Secondary soft glow */}
      <div
        className="pointer-events-none absolute transition-all duration-700 ease-in-out"
        style={{
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isOn ? '300px' : '0px',
          height: isOn ? '400px' : '0px',
          opacity: isOn ? 0.6 : 0,
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255, 200, 80, 0.2) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Main content area */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Lamp Assembly */}
        <div className="relative flex flex-col items-center">
          {/* Ceiling mount / top anchor bar */}
          <div
            className="h-2 w-20 rounded-b-md transition-colors duration-700"
            style={{
              backgroundColor: isOn ? '#B8B0A0' : '#3A3550',
            }}
          />

          {/* Lamp rod connecting mount to shade */}
          <div
            className="h-10 w-1.5 transition-colors duration-700"
            style={{
              backgroundColor: isOn ? '#9E978A' : '#2E2944',
            }}
          />

          {/* Lamp shade */}
          <div className="relative">
            <svg width="180" height="60" viewBox="0 0 180 60" fill="none" className="block">
              {/* Shade body - a trapezoid shape */}
              <path
                d="M30 0 H150 L175 55 Q175 60 170 60 H10 Q5 60 5 55 Z"
                className="transition-all duration-700"
                fill={isOn ? '#4A4540' : '#252040'}
                stroke={isOn ? '#6B6560' : '#3A3560'}
                strokeWidth="1"
              />
              {/* Inner highlight on the shade */}
              <path
                d="M35 4 H145 L165 52 H15 Z"
                className="transition-all duration-700"
                fill={isOn ? '#555048' : '#2A2548'}
                opacity="0.5"
              />
            </svg>

            {/* Bulb glow halo (visible when on) */}
            <div
              className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700"
              style={{
                width: isOn ? '60px' : '20px',
                height: isOn ? '60px' : '20px',
                background: isOn
                  ? 'radial-gradient(circle, rgba(255,220,120,0.9) 0%, rgba(255,200,80,0.4) 40%, transparent 70%)'
                  : 'none',
                boxShadow: isOn
                  ? '0 0 40px 15px rgba(255, 200, 80, 0.3), 0 0 80px 30px rgba(255, 200, 80, 0.1)'
                  : 'none',
              }}
            />

            {/* The light bulb */}
            <div
              className="absolute -bottom-2 left-1/2 h-6 w-5 -translate-x-1/2 rounded-b-full transition-all duration-500"
              style={{
                backgroundColor: isOn ? '#FFF0C0' : '#1A1830',
                boxShadow: isOn ? '0 4px 20px rgba(255, 200, 80, 0.6)' : 'none',
              }}
            />
          </div>

          {/* Pull Chain Assembly */}
          <div className="relative mt-1 flex flex-col items-center">
            {/* Chain string - drawn as a thin vertical line that stretches */}
            <div
              className={cn('w-[2px] origin-top transition-all', chainSwing ? 'animate-pulse' : '')}
              style={{
                height: `${chainLength}px`,
                backgroundColor: isOn ? '#9E978A' : '#4A4570',
                transitionDuration: isDragging ? '0ms' : '300ms',
                transitionTimingFunction: isDragging
                  ? 'linear'
                  : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />

            {/* Chain links decoration (small beads along the chain) */}
            {Array.from({ length: Math.floor(chainLength / 12) }, (_, i) => (
              <div
                key={i}
                className="absolute h-[5px] w-[5px] rounded-full transition-colors duration-700"
                style={{
                  top: `${8 + i * 12}px`,
                  backgroundColor: isOn ? '#B8B0A0' : '#5A5580',
                }}
              />
            ))}

            {/* Pull handle (draggable area) */}
            <div
              ref={chainHandleRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                'relative cursor-grab touch-none active:cursor-grabbing',
                'transition-transform duration-300',
                isDragging ? 'scale-110' : 'hover:scale-105'
              )}
            >
              {/* Decorative ball at the end of the chain */}
              <div
                className="h-5 w-5 rounded-full shadow-md transition-all duration-700"
                style={{
                  backgroundColor: isOn ? '#8B8478' : '#5A5580',
                  boxShadow: isDragging
                    ? `0 0 12px ${isOn ? 'rgba(200, 180, 120, 0.5)' : 'rgba(120, 100, 200, 0.5)'}`
                    : `0 2px 4px rgba(0,0,0,0.2)`,
                }}
              />

              {/* Invisible larger hit area for easier grabbing */}
              <div className="absolute -inset-4" />
            </div>
          </div>
        </div>

        {/* Instruction text below the chain */}
        <p
          className="mt-8 text-sm font-medium uppercase tracking-wider transition-colors duration-700"
          style={{
            color: isOn ? 'rgba(80, 70, 60, 0.6)' : 'rgba(180, 170, 200, 0.4)',
          }}
        >
          Pull to {isOn ? 'turn off' : 'turn on'}
        </p>

        {/* Demo content card - to showcase the light/dark mode effect */}
        <div
          className="mt-8 w-72 rounded-2xl border p-6 backdrop-blur-sm transition-all duration-700"
          style={{
            backgroundColor: isOn ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.04)',
            borderColor: isOn ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
            boxShadow: isOn
              ? '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
              : '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Card header */}
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-700"
              style={{
                backgroundColor: isOn ? '#FEF3C7' : '#312E81',
              }}
            >
              {/* Sun or Moon icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="transition-all duration-700"
              >
                {isOn ? (
                  // Sun icon
                  <>
                    <circle cx="10" cy="10" r="4" fill="#F59E0B" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <line
                        key={angle}
                        x1={10 + 6 * Math.cos((angle * Math.PI) / 180)}
                        y1={10 + 6 * Math.sin((angle * Math.PI) / 180)}
                        x2={10 + 8 * Math.cos((angle * Math.PI) / 180)}
                        y2={10 + 8 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    ))}
                  </>
                ) : (
                  // Moon icon
                  <path
                    d="M15 10.5C15 13.54 12.54 16 9.5 16C7.24 16 5.3 14.66 4.4 12.73C4.83 12.9 5.3 13 5.8 13C8.28 13 10.3 10.98 10.3 8.5C10.3 6.74 9.3 5.21 7.82 4.45C8.33 4.16 8.9 4 9.5 4C12.54 4 15 6.46 15 9.5V10.5Z"
                    fill="#818CF8"
                  />
                )}
              </svg>
            </div>
            <div>
              <h3
                className="text-sm font-semibold transition-colors duration-700"
                style={{
                  color: isOn ? '#1C1917' : '#E8E5F0',
                }}
              >
                {isOn ? 'Light Mode' : 'Dark Mode'}
              </h3>
              <p
                className="text-xs transition-colors duration-700"
                style={{
                  color: isOn ? '#78716C' : '#7C7A90',
                }}
              >
                {isOn ? 'Bright and clear' : 'Easy on the eyes'}
              </p>
            </div>
          </div>

          {/* Fake content lines */}
          <div className="space-y-2.5">
            {[85, 100, 60].map((width, i) => (
              <div
                key={i}
                className="h-2.5 rounded-full transition-colors duration-700"
                style={{
                  width: `${width}%`,
                  backgroundColor: isOn ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                }}
              />
            ))}
          </div>

          {/* Fake action button */}
          <div
            className="mt-5 flex h-9 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-700"
            style={{
              backgroundColor: isOn ? '#1C1917' : '#6366F1',
              color: '#FFFFFF',
            }}
          >
            Get Started
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        {!isFullscreen && (
          <div
            className="mt-6 text-center text-xs transition-colors duration-700"
            style={{
              color: isOn ? 'rgba(80, 70, 60, 0.4)' : 'rgba(180, 170, 200, 0.3)',
            }}
          >
            Press{' '}
            <kbd
              className="mx-1 rounded border px-1.5 py-0.5 text-[10px] transition-colors duration-700"
              style={{
                borderColor: isOn ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                backgroundColor: isOn ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
              }}
            >
              F
            </kbd>{' '}
            for fullscreen
          </div>
        )}
      </div>
    </div>
  );
}
