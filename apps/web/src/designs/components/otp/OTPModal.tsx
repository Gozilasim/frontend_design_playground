'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

// OTP verification status lifecycle
type OTPStatus = 'typing' | 'merging' | 'verifying' | 'success';

// Duration constants (milliseconds)
const MERGE_DURATION = 600;
const VERIFY_DURATION = 5000;
const CONFETTI_PARTICLE_COUNT = 80;

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Lightweight confetti particle definition
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  opacity: number;
}

// Confetti color palette
const CONFETTI_COLORS = [
  '#22C55E', // neon green
  '#4ADE80', // light green
  '#FFD700', // gold
  '#FDE68A', // light gold
  '#FFFFFF', // white
  '#A78BFA', // violet
  '#60A5FA', // blue
  '#F472B6', // pink
];

export default function OTPModal({ isOpen, onClose }: OTPModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [status, setStatus] = useState<OTPStatus>('typing');
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && status === 'typing') {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle Resend action
  const handleResend = useCallback(() => {
    if (resendCooldown > 0 || status !== 'typing') return;

    // Reset OTP slots
    setOtp(['', '', '', '']);
    setProgress(0);

    // Focus first slot
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    // Start 60-second countdown
    setResendCooldown(60);
  }, [resendCooldown, status]);

  // Phase 2: 5-second verification countdown
  const startVerification = useCallback(() => {
    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / VERIFY_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setStatus('success');
      }
    }, 16); // ~60fps update
  }, []);

  // Phase 1: Merge animation
  const triggerMerge = useCallback(() => {
    setStatus('merging');

    // After merge animation completes, start verification
    setTimeout(() => {
      setStatus('verifying');
      startVerification();
    }, MERGE_DURATION);
  }, [startVerification]);

  // Handle digit input with auto-focus shifting
  const handleInput = useCallback(
    (index: number, value: string) => {
      if (status !== 'typing') return;

      // Only accept single digits
      const digit = value.replace(/\D/g, '').slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      // Auto-advance focus to next input
      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }

      // Trigger merge when all 4 digits are entered
      if (digit && index === 3 && newOtp.every((d) => d !== '')) {
        triggerMerge();
      }
    },
    [otp, status, triggerMerge]
  );

  // Handle backspace to shift focus backwards
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (status !== 'typing') return;

      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    },
    [otp, status]
  );

  // Handle paste for quick entry
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (status !== 'typing') return;
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
      if (pastedData.length === 0) return;

      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);

      // Focus the next empty slot or last filled slot
      const nextEmpty = newOtp.findIndex((d) => d === '');
      if (nextEmpty !== -1) {
        inputRefs.current[nextEmpty]?.focus();
      } else {
        inputRefs.current[3]?.focus();
        // All filled, trigger merge
        triggerMerge();
      }
    },
    [otp, status, triggerMerge]
  );

  // Render loop for confetti particles
  const renderConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeCount = 0;
      particlesRef.current.forEach((p) => {
        if (p.opacity <= 0) return;
        activeCount++;

        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;
        p.opacity -= 0.005;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (activeCount > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Initialize confetti particles and start animation loop
  const initConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Generate particles bursting from center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;

    particlesRef.current = Array.from({ length: CONFETTI_PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 6;
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3,
        size: 3 + Math.random() * 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.08 + Math.random() * 0.04,
        opacity: 1,
      };
    });

    renderConfetti();
  }, [renderConfetti]);

  // Phase 3: Confetti on success
  useEffect(() => {
    if (status === 'success') {
      initConfetti();
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, initConfetti]);

  // Reset entire demo back to initial state
  const resetDemo = useCallback(() => {
    setOtp(['', '', '', '']);
    setStatus('typing');
    setProgress(0);
    setResendCooldown(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  // Close with exit animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      resetDemo();
      onClose();
    }, 300);
  }, [onClose, resetDemo]);

  if (!isOpen) return null;

  const isMerged = status === 'merging' || status === 'verifying' || status === 'success';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-all duration-300',
        isClosing ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Overlay backdrop with blur */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-md',
          'transition-opacity duration-300',
          isClosing ? 'opacity-0' : 'opacity-100'
        )}
        onClick={handleClose}
      />

      {/* Modal card */}
      <div
        className={cn(
          'relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl',
          'border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl',
          'transition-all duration-500 ease-out',
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        {/* Confetti canvas layer */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-30"
        />

        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-violet-500/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/15 blur-[80px]" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            'absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full',
            'bg-white/5 text-slate-400 transition-all duration-200',
            'hover:bg-white/10 hover:text-white'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Modal content */}
        <div className="relative z-10 px-8 pb-10 pt-10">
          {/* Header section */}
          <div className="mb-8 text-center">
            {/* Security shield icon */}
            <div
              className={cn(
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl',
                'transition-all duration-700',
                status === 'success'
                  ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                  : 'bg-violet-500/15'
              )}
            >
              {status === 'success' ? (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="animate-[checkPop_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]"
                >
                  <path
                    d="M8 16L14 22L24 10"
                    stroke="#22C55E"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-[checkDraw_0.6s_ease-out_0.2s_forwards]"
                    style={{
                      strokeDasharray: 30,
                      strokeDashoffset: 30,
                    }}
                  />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 6V12C4 16.42 7.4 20.56 12 22C16.6 20.56 20 16.42 20 12V6L12 2Z"
                    stroke="#A78BFA"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="rgba(167, 139, 250, 0.1)"
                  />
                  <path
                    d="M12 8V13"
                    stroke="#A78BFA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1" fill="#A78BFA" />
                </svg>
              )}
            </div>

            <h2
              className={cn(
                'text-xl font-bold tracking-tight text-white',
                'transition-all duration-500'
              )}
            >
              {status === 'success' ? 'Verified!' : 'Verification Code'}
            </h2>
            <p
              className={cn(
                'mt-1.5 text-sm transition-all duration-500',
                status === 'success' ? 'text-emerald-400' : 'text-slate-400'
              )}
            >
              {status === 'success'
                ? 'Your identity has been confirmed'
                : status === 'verifying'
                  ? 'Verifying your code...'
                  : status === 'merging'
                    ? 'Processing...'
                    : 'Enter the 4-digit code sent to your device'}
            </p>
          </div>

          {/* OTP Input Section */}
          <div
            className={cn(
              'relative mx-auto mb-6',
              status === 'success' ? 'max-w-[200px]' : 'max-w-[280px]'
            )}
          >
            {status === 'verifying' ? (
              <div
                className={cn(
                  'mx-auto h-16 w-[224px] overflow-hidden rounded-2xl border bg-slate-950/70 relative flex items-center justify-center',
                  'transition-all duration-500 ease-out',
                  'animate-[pulseGlow_1.5s_infinite_alternate]'
                )}
                style={{
                  boxShadow: '0 0 20px rgba(167, 139, 250, 0.15), inset 0 0 15px rgba(167, 139, 250, 0.05)',
                  borderColor: 'rgba(167, 139, 250, 0.25)',
                }}
              >
                {/* Progress bar inside the capsule */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-violet-600/30 to-indigo-500/40 border-r border-violet-500/50 transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
                
                {/* Scanner/charging line leading the progress */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-violet-400 shadow-[0_0_12px_#A78BFA] transition-all duration-300"
                  style={{
                    left: `${progress}%`,
                    opacity: progress > 0 && progress < 100 ? 1 : 0,
                  }}
                />

                {/* The digits centered with elegant spacing */}
                <div className="relative z-10 flex items-center justify-center gap-7 text-2xl font-bold text-white tracking-wider">
                  {otp.map((digit, index) => (
                    <span key={index} className="w-6 text-center select-none">{digit}</span>
                  ))}
                </div>
              </div>
            ) : (
              /* Input slots container */
              <div
                className={cn(
                  'flex items-center justify-center transition-all ease-in-out',
                  isMerged ? 'gap-0' : 'gap-3',
                  status === 'success'
                    ? 'scale-90 opacity-0 duration-500'
                    : 'scale-100 opacity-100 duration-500'
                )}
                style={{
                  transitionDuration: isMerged ? `${MERGE_DURATION}ms` : '500ms',
                }}
              >
                {otp.map((digit, i) => (
                  <div key={i} className="relative">
                    <input
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInput(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      disabled={status !== 'typing'}
                      className={cn(
                        'h-16 w-14 text-center text-2xl font-bold',
                        'border bg-white/5 text-white outline-none',
                        'transition-all ease-in-out',
                        'placeholder:text-slate-600',
                        'focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20',
                        'disabled:cursor-default disabled:opacity-80',
                        // Dynamic border-radius for merge effect
                        isMerged
                          ? cn(
                              i === 0 ? 'rounded-l-2xl' : 'rounded-l-none',
                              i === 3 ? 'rounded-r-2xl' : 'rounded-r-none',
                              'border-white/5'
                            )
                          : 'rounded-2xl border-white/10'
                      )}
                      style={{
                        transitionDuration: `${MERGE_DURATION}ms`,
                        caretColor: 'transparent',
                      }}
                    />
                    {/* Typing cursor indicator */}
                    {status === 'typing' && !digit && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-6 w-[2px] animate-pulse rounded-full bg-violet-400/50" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Orbiting dots around capsule during verification */}
            {status === 'verifying' && (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
                <div
                  className="relative mt-8 h-16 w-[232px]"
                  style={{ perspective: '200px' }}
                >
                  {[0, 1, 2].map((dotIndex) => (
                    <div
                      key={dotIndex}
                      className="absolute h-2 w-2 rounded-full bg-violet-400"
                      style={{
                        animation: `orbitDot 2s linear infinite`,
                        animationDelay: `${dotIndex * 0.66}s`,
                        top: '50%',
                        left: '50%',
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Success checkmark badge (overlaps input area) */}
            {status === 'success' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={cn(
                    'flex h-20 w-20 items-center justify-center rounded-full',
                    'bg-emerald-500/15 shadow-lg shadow-emerald-500/20',
                    'animate-[successPop_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]'
                  )}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="#22C55E"
                      strokeWidth="2"
                      fill="rgba(34, 197, 94, 0.1)"
                    />
                    <path
                      d="M12 20L18 26L28 14"
                      stroke="#22C55E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 30,
                        strokeDashoffset: 30,
                        animation: 'checkDraw 0.6s ease-out 0.3s forwards',
                      }}
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col items-center gap-3">
            {status === 'success' ? (
              <>
                <button
                  onClick={resetDemo}
                  className={cn(
                    'w-full rounded-xl px-6 py-3.5 text-sm font-semibold',
                    'bg-gradient-to-r from-emerald-600 to-emerald-500',
                    'text-white shadow-lg shadow-emerald-900/30',
                    'transition-all duration-200',
                    'hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-900/40'
                  )}
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className={cn(
                    'text-sm font-medium text-slate-400 transition-colors duration-200',
                    'hover:text-white'
                  )}
                >
                  Close
                </button>
              </>
            ) : status === 'typing' ? (
              <div className="flex flex-col items-center gap-1.5 text-sm">
                <span className="text-slate-400">Didn't receive the code?</span>
                {resendCooldown > 0 ? (
                  <div className="flex items-center gap-2 font-medium text-slate-500">
                    <svg className="h-4 w-4 text-violet-400" viewBox="0 0 20 20">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="rgba(167, 139, 250, 0.15)"
                        strokeWidth="2"
                        fill="transparent"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={50.27}
                        strokeDashoffset={50.27 * (1 - resendCooldown / 60)}
                        strokeLinecap="round"
                        className="origin-center -rotate-90 transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <span>Resend in {resendCooldown}s</span>
                  </div>
                ) : (
                  <button
                    onClick={handleResend}
                    className={cn(
                      'font-semibold text-violet-400 transition-colors duration-200',
                      'hover:text-violet-300 active:text-violet-500'
                    )}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <svg
                  className="h-4 w-4 animate-spin text-violet-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="50 50"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  {status === 'merging' ? 'Preparing...' : 'Verifying identity...'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Inline keyframe styles */}
        <style jsx>{`
          @keyframes checkDraw {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes checkPop {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes successPop {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            60% {
              transform: scale(1.15);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes pulseGlow {
            0% {
              box-shadow: 0 0 12px rgba(167, 139, 250, 0.1), inset 0 0 10px rgba(167, 139, 250, 0.05);
              border-color: rgba(167, 139, 250, 0.2);
            }
            100% {
              box-shadow: 0 0 24px rgba(167, 139, 250, 0.3), inset 0 0 18px rgba(167, 139, 250, 0.15);
              border-color: rgba(167, 139, 250, 0.55);
            }
          }
          @keyframes shimmerBar {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
          @keyframes orbitDot {
            0% {
              transform: translate(-120px, 0) scale(0.6);
              opacity: 0;
            }
            10% {
              opacity: 0.7;
            }
            50% {
              transform: translate(0px, -24px) scale(1);
              opacity: 0.9;
            }
            90% {
              opacity: 0.7;
            }
            100% {
              transform: translate(120px, 0) scale(0.6);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
