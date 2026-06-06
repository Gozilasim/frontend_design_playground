'use client';

import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

export default function LoginNeon({ viewport, isFullscreen, background }: DesignProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center p-4',
        'relative overflow-hidden'
      )}
      style={getBackgroundStyle(background)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
      <div className="absolute left-0 right-0 top-0 h-[200px] bg-gradient-to-b from-purple-500/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-cyan-500/10 to-transparent" />

      <div className="relative w-full max-w-sm">
        <div className="relative rounded-2xl border border-cyan-400/30 bg-black/40 p-8 shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-400/10" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-400/5" />

          <div className="relative mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-cyan-400/25">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Neon Access
              </span>
            </h1>
            <p className="mt-1 text-sm text-white/40">Enter the cyber realm</p>
          </div>

          <form className="relative space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/60">
                Username
              </label>
              <input
                id="email"
                type="text"
                placeholder="neon_runner_2077"
                className={cn(
                  'w-full rounded-lg border border-cyan-400/30 bg-black/40 px-4 py-3',
                  'text-white placeholder:text-white/30',
                  'focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50',
                  'transition-all duration-200',
                  'bg-gradient-to-r from-black/60 to-transparent'
                )}
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/60">
                Access Code
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className={cn(
                  'w-full rounded-lg border border-cyan-400/30 bg-black/40 px-4 py-3',
                  'text-white placeholder:text-white/30',
                  'focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50',
                  'transition-all duration-200'
                )}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-cyan-400/30 bg-black/40 text-cyan-400 focus:ring-2 focus:ring-cyan-400"
                />
                <span className="text-sm text-white/60">Auto-login</span>
              </label>
            </div>

            <button
              type="submit"
              className={cn(
                'w-full rounded-lg px-4 py-3 font-semibold uppercase tracking-wider text-black',
                'bg-gradient-to-r from-cyan-400 to-purple-500',
                'hover:from-cyan-300 hover:to-purple-400',
                'shadow-lg shadow-cyan-400/30',
                'transition-all duration-200',
                'active:scale-[0.98]',
                'relative overflow-hidden',
                'before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-300 before:to-purple-400 before:opacity-0 before:transition-opacity hover:before:opacity-100'
              )}
            >
              <span className="relative z-10">Initialize</span>
            </button>
          </form>

          <div className="mt-6 border-t border-cyan-400/20 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium text-cyan-300',
                  'border border-cyan-400/20 bg-cyan-400/10',
                  'hover:border-cyan-400/40 hover:bg-cyan-400/20',
                  'transition-all duration-200'
                )}
              >
                Guest Mode
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium text-purple-300',
                  'border border-purple-400/20 bg-purple-400/10',
                  'hover:border-purple-400/40 hover:bg-purple-400/20',
                  'transition-all duration-200'
                )}
              >
                Register
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 font-mono text-xs text-white/30">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            System Online
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Secure
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
            v2.7.1
          </span>
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
          linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)
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
      return { backgroundColor: '#050510' };
  }
}
