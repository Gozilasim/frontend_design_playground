'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { useDesignContext } from '@/providers/DesignProvider';
import { getDesignById } from '@/data/designRegistry';
import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

interface DesignErrorProps {
  error: Error;
  reset: () => void;
}

function DesignError({ error, reset }: DesignErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="bg-destructive/10 border-destructive/20 mb-4 max-w-md rounded-lg border p-4">
        <h3 className="mb-2 font-semibold text-destructive">Failed to load design</h3>
        <p className="text-muted-foreground mb-4 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="hover:text-primary/80 px-4 py-2 text-sm font-medium text-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function DesignSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-80 animate-pulse space-y-4">
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="mt-4 h-12 rounded bg-muted" />
        <div className="h-12 rounded bg-muted" />
        <div className="h-12 w-4/5 rounded bg-muted" />
      </div>
    </div>
  );
}

let designComponentCache: Map<string, ComponentType<DesignProps>> = new Map();

function getDesignComponent(designId: string): ComponentType<DesignProps> | null {
  if (designComponentCache.has(designId)) {
    return designComponentCache.get(designId)!;
  }

  const design = getDesignById(designId);
  if (!design) return null;

  const LazyComponent = lazy(() =>
    import(`@/designs/${design.categoryId}/${design.id.replace(/-/g, '/')}`)
      .then((module) => {
        const Component = module.default;
        designComponentCache.set(designId, Component);
        return { default: Component };
      })
      .catch(() => {
        return {
          default: () => (
            <DesignError error={new Error('Failed to load design')} reset={() => {}} />
          ),
        };
      })
  );

  designComponentCache.set(designId, LazyComponent);
  return LazyComponent;
}

export function DesignCanvas() {
  const { selectedDesignId, viewport, isFullscreen, background } = useDesignContext();
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const design = selectedDesignId ? getDesignById(selectedDesignId) : null;
  const Component = design ? design.component : null;

  const handleRetry = () => {
    setError(null);
    setRetryKey((k) => k + 1);
  };

  if (!selectedDesignId || !design) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-center justify-center p-8 text-center',
          'bg-background'
        )}
        style={getBackgroundStyle(background)}
      >
        <div className="max-w-md">
          <h2 className="mb-2 text-2xl font-semibold">Select a Design</h2>
          <p className="text-muted-foreground">
            Choose a design from the sidebar to preview it here.
          </p>
          <div className="bg-muted/50 mt-6 rounded-lg border border-border p-4">
            <p className="text-muted-foreground font-mono text-sm">
              Shortcuts: <kbd className="rounded border bg-background px-1.5 py-0.5">F</kbd>{' '}
              Fullscreen <kbd className="rounded border bg-background px-1.5 py-0.5">D</kbd> Device{' '}
              <kbd className="rounded border bg-background px-1.5 py-0.5">B</kbd> Background
            </p>
          </div>
        </div>
      </div>
    );
  }

  const designProps: DesignProps = {
    viewport,
    isFullscreen,
    background,
  };

  return (
    <div
      className={cn('relative h-full w-full', 'bg-background')}
      style={getBackgroundStyle(background)}
    >
      <Suspense fallback={<DesignSkeleton />}>
        {Component && (
          <ErrorBoundary
            fallback={({ error, reset }) => <DesignError error={error} reset={reset} />}
            key={retryKey}
          >
            <Component {...designProps} />
          </ErrorBoundary>
        )}
      </Suspense>
    </div>
  );
}

function getBackgroundStyle(background: { type: string; value: string }): React.CSSProperties {
  switch (background.type) {
    case 'solid':
      return { backgroundColor: background.value };
    case 'gradient':
      return { backgroundImage: background.value };
    case 'grid':
      const size = parseInt(background.value, 10);
      return {
        backgroundImage: `
          linear-gradient(rgba(128,128,128,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(128,128,128,0.1) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      };
    case 'image':
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    default:
      return {};
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: ({ error, reset }: { error: Error; reset: () => void }) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Design render error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error!, reset: this.reset });
    }
    return this.props.children;
  }
}

import { useState } from 'react';
import * as React from 'react';
