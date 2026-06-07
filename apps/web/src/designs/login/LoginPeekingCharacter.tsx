'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

export default function LoginPeekingCharacter({ viewport, isFullscreen, background }: DesignProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Interaction states for the peeking character
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for tracking eye positions
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mouse coordinates for eye movement when idle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle password change to trigger the typing animation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Calculate coordinates for the pupil offsets
  const getPupilStyle = (eyeRef: React.RefObject<HTMLDivElement>) => {
    // If we are actively peeking (password is focused and visible)
    if (isPasswordFocused && showPassword) {
      // State 1: Active typing -> Look straight up at the password field
      if (isTyping) {
        return { transform: 'translate(0px, -6px)' };
      }
      // State 2: Stopped typing -> Look guilty to the side
      return { transform: 'translate(-5px, 2px)' };
    }

    // State 3: Focused on email field -> Look upwards-left toward the email input
    if (isEmailFocused) {
      return { transform: 'translate(-2px, -5px)' };
    }

    // State 4: Idle/Hidden -> Track the mouse pointer
    if (eyeRef.current) {
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = mousePos.x - eyeCenterX;
      const dy = mousePos.y - eyeCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Limit pupil movement to a max of 5px radius
      const maxOffset = 5;
      const angle = Math.atan2(dy, dx);
      
      // Scale down movement slightly for smoother feel
      const intensity = Math.min(maxOffset, distance / 40);
      
      const offsetX = Math.cos(angle) * intensity;
      const offsetY = Math.sin(angle) * intensity;

      return {
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      };
    }

    return { transform: 'translate(0px, 0px)' };
  };

  // Determine character position: peeking or hidden
  // 1. When typing/focusing email: peek up.
  // 2. When typing/focusing password: peek up only if password is plain text (visible).
  // 3. Otherwise: duck down and hide.
  const isPeeking = isEmailFocused || (isPasswordFocused && showPassword);

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center p-4',
        'relative overflow-hidden transition-all duration-300'
      )}
      style={getBackgroundStyle(background)}
    >
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] animate-pulse delay-1000" />
      
      {/* Card Wrapper - Relative position with high z-index to manage character placement */}
      <div className="relative w-full max-w-md">
        
        {/* The Peeping Character - positioned absolutely behind the card */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out pointer-events-none select-none z-0',
            // Cubic bezier bounce when peeking up, fast slide down when hiding
            isPeeking 
              ? 'bottom-[calc(100%-8px)] translate-y-0 opacity-100 scale-100' 
              : 'bottom-[calc(100%-25px)] translate-y-12 opacity-0 scale-95'
          )}
          style={{
            transitionTimingFunction: isPeeking ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'ease-in',
          }}
        >
          {/* Character Body */}
          <div className="relative w-28 h-24 rounded-t-full bg-gradient-to-b from-violet-600 to-indigo-700 border-2 border-b-0 border-violet-400/30 flex items-end justify-center pb-3 shadow-lg shadow-violet-900/30">
            {/* Cute Cheek Blushes */}
            <div className="absolute left-3 bottom-4 w-3.5 h-2 bg-pink-400/40 rounded-full blur-[1px]" />
            <div className="absolute right-3 bottom-4 w-3.5 h-2 bg-pink-400/40 rounded-full blur-[1px]" />
            
            {/* Eyes Container */}
            <div className="flex items-center gap-2 mb-2">
              {/* Left Eye */}
              <div 
                ref={leftEyeRef}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full bg-slate-950 transition-transform duration-100 ease-out"
                  style={getPupilStyle(leftEyeRef)}
                />
              </div>

              {/* Right Eye */}
              <div 
                ref={rightEyeRef}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full bg-slate-950 transition-transform duration-100 ease-out"
                  style={getPupilStyle(rightEyeRef)}
                />
              </div>
            </div>

            {/* Little Hands Gripping the Edge */}
            <div className="absolute -bottom-1 left-4 w-5 h-3 rounded-t-full bg-violet-500 border border-b-0 border-violet-400/40" />
            <div className="absolute -bottom-1 right-4 w-5 h-3 rounded-t-full bg-violet-500 border border-b-0 border-violet-400/40" />
          </div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-slate-400">Sign in to your account</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="name@domain.com"
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4',
                    'text-white placeholder:text-slate-500',
                    'focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
                    'transition-all duration-200'
                  )}
                  autoComplete="email"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => {
                    setIsPasswordFocused(false);
                    setIsTyping(false);
                  }}
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10',
                    'text-white placeholder:text-slate-500',
                    'focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
                    'transition-all duration-200'
                  )}
                  autoComplete="current-password"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & submit */}
            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className={cn(
                    'h-4 w-4 rounded border-white/10 bg-white/5 text-violet-600',
                    'focus:ring-2 focus:ring-violet-500/20 focus:ring-offset-0 focus:ring-offset-transparent'
                  )}
                />
                <span className="text-xs text-slate-400">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              className={cn(
                'w-full rounded-xl py-3 px-4 font-semibold text-white',
                'bg-gradient-to-r from-violet-600 to-indigo-600',
                'hover:from-violet-500 hover:to-indigo-500',
                'shadow-lg shadow-violet-950/40 hover:shadow-violet-950/60',
                'active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                'transition-all duration-200'
              )}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <a
                href="#"
                className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Keyboard shortcut clues */}
        {!isFullscreen && (
          <div className="mt-4 text-center text-xs text-slate-500">
            Press <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">F</kbd> for fullscreen •{' '}
            <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">D</kbd> for device size
          </div>
        )}
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
      const size = parseInt(background.value, 10) || 24;
      return {
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundColor: '#030712',
      };
    case 'image':
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    default:
      return { backgroundColor: '#030712' };
  }
}
