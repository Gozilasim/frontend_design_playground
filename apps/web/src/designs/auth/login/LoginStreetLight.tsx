'use client';

import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

export default function LoginStreetLight({ viewport, isFullscreen, background }: DesignProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center p-4',
        'relative overflow-hidden'
      )}
      style={getBackgroundStyle(background)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-cyan-400/10" />
      <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-400/10 blur-3xl delay-1000" />

      <div className="relative w-full max-w-sm">
        <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-400/25">
              <svg
                className="h-8 w-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-1 text-white/50">Sign in to continue to your dashboard</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3',
                    'text-white placeholder:text-white/30',
                    'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400/50',
                    'transition-all duration-200'
                  )}
                  autoComplete="email"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 transition-opacity hover:opacity-100" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/70">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3',
                    'text-white placeholder:text-white/30',
                    'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400/50',
                    'transition-all duration-200'
                  )}
                  autoComplete="current-password"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 transition-opacity hover:opacity-100" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                />
                <span className="text-sm text-white/70">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-yellow-400 transition-colors hover:text-yellow-300"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className={cn(
                'w-full rounded-xl px-4 py-3 font-semibold text-black',
                'bg-gradient-to-r from-yellow-400 to-orange-500',
                'hover:from-yellow-300 hover:to-orange-400',
                'shadow-lg shadow-yellow-400/25',
                'transition-all duration-200',
                'active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent'
              )}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">
              Don&apos;t have an account?{' '}
              <a
                href="#"
                className="font-medium text-yellow-400 transition-colors hover:text-yellow-300"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-white/40">
          <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-2 py-1">F</kbd>{' '}
          Fullscreen{' '}
          <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-2 py-1">D</kbd> Device{' '}
          <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-2 py-1">B</kbd>{' '}
          Background
        </div>
      </div>
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
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
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
      return { backgroundColor: '#0a0f1a' };
  }
}
