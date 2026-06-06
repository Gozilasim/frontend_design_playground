'use client';

import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

export default function LoginGlassmorphism({ viewport, isFullscreen, background }: DesignProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center p-4',
        'relative overflow-hidden'
      )}
      style={getBackgroundStyle(background)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-pink-500/10" />
      <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5" />

          <div className="relative mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-pink-500 shadow-lg shadow-blue-500/25">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
            <p className="mt-1 text-gray-500">Sign in to your account</p>
          </div>

          <form className="relative space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={cn(
                  'w-full rounded-xl border border-white/30 bg-white/20 px-4 py-3',
                  'text-gray-900 placeholder:text-gray-400',
                  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                  'transition-all duration-200',
                  'backdrop-blur-sm'
                )}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={cn(
                  'w-full rounded-xl border border-white/30 bg-white/20 px-4 py-3',
                  'text-gray-900 placeholder:text-gray-400',
                  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                  'transition-all duration-200',
                  'backdrop-blur-sm'
                )}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 bg-white/30 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 transition-colors hover:text-blue-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className={cn(
                'w-full rounded-xl px-4 py-3 font-semibold text-white',
                'bg-gradient-to-r from-blue-500 to-pink-500',
                'hover:from-blue-600 hover:to-pink-600',
                'shadow-lg shadow-blue-500/25',
                'transition-all duration-200',
                'active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <a
                href="#"
                className="font-medium text-blue-600 transition-colors hover:text-blue-500"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          <kbd className="mx-1 rounded border border-gray-200 bg-white/50 px-2 py-1">F</kbd>{' '}
          Fullscreen{' '}
          <kbd className="mx-1 rounded border border-gray-200 bg-white/50 px-2 py-1">D</kbd> Device{' '}
          <kbd className="mx-1 rounded border border-gray-200 bg-white/50 px-2 py-1">B</kbd>{' '}
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
          linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
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
      return { backgroundColor: '#f8fafc' };
  }
}
