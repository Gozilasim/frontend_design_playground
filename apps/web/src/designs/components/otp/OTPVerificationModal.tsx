'use client';

import React, { useState } from 'react';
import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';
import OTPModal from './OTPModal';

export default function OTPVerificationModal({ isFullscreen }: DesignProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center overflow-hidden relative select-none',
        'transition-colors duration-700 ease-in-out bg-[#070B14]'
      )}
    >
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-indigo-600/6 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-slate-500/3 blur-[140px]" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main security panel content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Security panel card */}
        <div
          className={cn(
            'w-full max-w-[380px] rounded-3xl',
            'border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl',
            'p-8 shadow-2xl shadow-black/20'
          )}
        >
          {/* Card header */}
          <div className="mb-6 flex items-start gap-4">
            {/* Shield icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6V12C4 16.42 7.4 20.56 12 22C16.6 20.56 20 16.42 20 12V6L12 2Z"
                  stroke="#A78BFA"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="rgba(167, 139, 250, 0.08)"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="#A78BFA"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Security Center
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Manage your account protection
              </p>
            </div>
          </div>

          {/* Security status items */}
          <div className="space-y-3">
            {/* Status row: Password */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">Password</span>
              </div>
              <span className="text-xs font-medium text-emerald-400">Strong</span>
            </div>

            {/* Status row: 2FA */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2L4 6V12C4 16.42 7.4 20.56 12 22C16.6 20.56 20 16.42 20 12V6L12 2Z"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8V13"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="16" r="1" fill="#F59E0B" />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">Two-Factor Auth</span>
              </div>
              <span className="text-xs font-medium text-amber-400">Not Verified</span>
            </div>

            {/* Status row: Sessions */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="14"
                      rx="2"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 22H16"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 18V22"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">Active Sessions</span>
              </div>
              <span className="text-xs font-medium text-emerald-400">1 Device</span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Trigger 2FA verification button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              'group relative w-full overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold',
              'bg-gradient-to-r from-violet-600 to-indigo-600',
              'text-white shadow-lg shadow-violet-900/30',
              'transition-all duration-300',
              'hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-900/50 hover:shadow-xl'
            )}
          >
            {/* Button shimmer effect */}
            <div
              className={cn(
                'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent',
                'transition-transform duration-1000 ease-out',
                'group-hover:translate-x-full'
              )}
            />
            <span className="relative flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6V12C4 16.42 7.4 20.56 12 22C16.6 20.56 20 16.42 20 12V6L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verify 2FA Identity
            </span>
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        {!isFullscreen && (
          <div className="text-center text-xs text-slate-600">
            Press{' '}
            <kbd className="mx-1 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">
              F
            </kbd>{' '}
            for fullscreen
          </div>
        )}
      </div>

      {/* The OTP Modal */}
      <OTPModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
