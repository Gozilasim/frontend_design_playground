'use client';

import { useDesignContext } from '@/providers/DesignProvider';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DeviceFrameProps {
  children: ReactNode;
}

export function DeviceFrame({ children }: DeviceFrameProps) {
  const { viewport, deviceFrameMode, isFullscreen, zoomLevel } = useDesignContext();

  const scale = zoomLevel / 100;
  const frameWidth = viewport.width * scale;
  const frameHeight = viewport.height * scale;

  const frameStyles = {
    width: frameWidth,
    height: frameHeight,
    transformOrigin: 'top center' as const,
  };

  if (deviceFrameMode === 'none' || isFullscreen) {
    return (
      <div
        className={cn('relative flex-shrink-0 bg-background', 'overflow-hidden')}
        style={frameStyles}
      >
        {children}
      </div>
    );
  }

  if (deviceFrameMode === 'browser') {
    return (
      <BrowserFrame style={frameStyles} viewport={viewport} scale={scale}>
        {children}
      </BrowserFrame>
    );
  }

  if (deviceFrameMode === 'mobile') {
    return (
      <MobileFrame style={frameStyles} viewport={viewport} scale={scale}>
        {children}
      </MobileFrame>
    );
  }

  if (deviceFrameMode === 'shorts') {
    return (
      <ShortsFrame style={frameStyles} viewport={viewport} scale={scale}>
        {children}
      </ShortsFrame>
    );
  }

  return <div style={frameStyles}>{children}</div>;
}

function BrowserFrame({
  children,
  style,
  viewport,
  scale,
}: {
  children: ReactNode;
  style: React.CSSProperties;
  viewport: { width: number; height: number };
  scale: number;
}) {
  const isDark = true;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-background shadow-2xl',
        'max-h-full max-w-full'
      )}
      style={style}
    >
      <div
        className="bg-muted/50 flex items-center gap-2 border-b border-border px-3 py-2.5"
        style={{ minHeight: 36 * scale }}
      >
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div
          className="bg-background/50 border-border/50 text-muted-foreground mx-4 flex-1 rounded-lg border px-3 py-1.5 font-mono text-xs"
          style={{ fontSize: 11 * scale }}
        >
          localhost:3000
        </div>
      </div>
      <div
        className="h-full w-full overflow-hidden"
        style={{ height: `calc(100% - ${36 * scale}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

function MobileFrame({
  children,
  style,
  viewport,
  scale,
}: {
  children: ReactNode;
  style: React.CSSProperties;
  viewport: { width: number; height: number };
  scale: number;
}) {
  const isNotched = viewport.width <= 390;

  return (
    <div
      className="relative rounded-[40px] bg-black p-1.5 shadow-2xl"
      style={{
        ...style,
        border: `${4 * scale}px solid #1a1a1a`,
        borderRadius: `${40 * scale}px`,
        padding: `${1.5 * scale}px`,
        boxShadow: `
          0 ${20 * scale}px ${60 * scale}px -10px rgba(0,0,0,0.5),
          0 0 0 ${1 * scale}px rgba(255,255,255,0.05) inset,
          0 0 0 ${2 * scale}px rgba(0,0,0,0.3) inset
        `,
      }}
    >
      {isNotched && (
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 bg-black"
          style={{
            width: `${120 * scale}px`,
            height: `${28 * scale}px`,
            borderRadius: `0 0 ${14 * scale}px ${14 * scale}px`,
            border: `${1 * scale}px solid #333`,
            borderTop: 'none',
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-600"
            style={{
              width: `${40 * scale}px`,
              height: `${4 * scale}px`,
            }}
          />
        </div>
      )}

      <div
        className="relative h-full w-full overflow-hidden rounded-[36px] bg-background"
        style={{
          borderRadius: `${36 * scale}px`,
        }}
      >
        {children}
      </div>

      <div
        className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/20 backdrop-blur-sm"
        style={{
          width: `${134 * scale}px`,
          height: `${5 * scale}px`,
          bottom: `${8 * scale}px`,
        }}
      />
    </div>
  );
}

function ShortsFrame({
  children,
  style,
  viewport,
  scale,
}: {
  children: ReactNode;
  style: React.CSSProperties;
  viewport: { width: number; height: number };
  scale: number;
}) {
  const safeTop = 100 * scale;
  const safeBottom = 200 * scale;
  const safeLeft = 40 * scale;
  const safeRight = 40 * scale;

  return (
    <div className="relative" style={style}>
      <div
        className="absolute inset-0 z-0 bg-background"
        style={{
          clipPath: `polygon(
            ${safeLeft}px 0,
            calc(100% - ${safeRight}px) 0,
            100% ${safeTop}px,
            100% calc(100% - ${safeBottom}px),
            calc(100% - ${safeRight}px) 100%,
            ${safeLeft}px 100%,
            0 calc(100% - ${safeBottom}px),
            0 ${safeTop}px
          )`,
        }}
      >
        {children}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          border: `${2 * scale}px dashed rgba(255,255,255,0.3)`,
          borderRadius: `${20 * scale}px`,
          clipPath: `polygon(
            ${safeLeft}px 0,
            calc(100% - ${safeRight}px) 0,
            100% ${safeTop}px,
            100% calc(100% - ${safeBottom}px),
            calc(100% - ${safeRight}px) 100%,
            ${safeLeft}px 100%,
            0 calc(100% - ${safeBottom}px),
            0 ${safeTop}px
          )`,
        }}
      >
        <div
          className="pointer-events-auto absolute left-2 top-2 font-mono text-xs text-white/50"
          style={{ fontSize: `${10 * scale}px` }}
        >
          Safe Area
        </div>
      </div>
    </div>
  );
}
