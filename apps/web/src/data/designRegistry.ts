import { ViewportPreset } from './viewportPresets';
import { LoginPeekingCharacter } from '@/designs/login';
import { LampToggle } from '@/designs/components';

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'grid';
  value: string;
}

export interface DesignProps {
  viewport: ViewportPreset;
  isFullscreen: boolean;
  background: BackgroundConfig;
}

export interface DesignEntry {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  component: React.ComponentType<DesignProps>;
  tags: string[];
  thumbnail?: string;
  recommendedViewport?: ViewportPreset;
  // The AI prompt used to generate this design, displayed via Copy Prompt button
  prompt?: string;
}

export const designRegistry: DesignEntry[] = [
  {
    id: 'peeking-character-login',
    categoryId: 'login',
    title: 'Peeking Character',
    description: 'A cute character peeks up from the bottom of the card when you type your password.',
    component: LoginPeekingCharacter,
    tags: ['animated', 'interactive', 'cute', 'glassmorphism', 'dark-mode'],
    recommendedViewport: { width: 375, height: 667, label: 'Mobile 375×667', deviceType: 'mobile' },
    prompt: `You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:

\`\`\`tsx
// peeking-character-login-page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesignProps {
  viewport?: any;
  isFullscreen?: boolean;
  background?: any;
}

export function LoginPage({ viewport, isFullscreen, background }: DesignProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
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

  // Determine character position: peeking or hidden
  // 1. When typing/focusing email: peek up.
  // 2. When typing/focusing password: peek up only if password is plain text (visible).
  // 3. Otherwise: duck down and hide.
  const isPeeking = isEmailFocused || (isPasswordFocused && showPassword);

  // Calculate coordinates for the pupil offsets
  const getPupilStyle = (eyeRef: React.RefObject<HTMLDivElement>) => {
    // If we are actively peeking (password is focused and visible)
    if (isPasswordFocused && showPassword) {
      // State 1: Active typing -> Look straight up at the password field
      if (isTyping) {
        return { transform: "translate(0px, -6px)" };
      }
      // State 2: Stopped typing -> Look guilty to the side
      return { transform: "translate(-5px, 2px)" };
    }

    // State 3: Focused on email field -> Look upwards-left toward the email input
    if (isEmailFocused) {
      return { transform: "translate(-2px, -5px)" };
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
        transform: \`translate(\${offsetX}px, \${offsetY}px)\`,
      };
    }

    return { transform: "translate(0px, 0px)" };
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#030712] p-4 relative overflow-hidden">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] animate-pulse delay-1000 pointer-events-none" />
      
      {/* Card Wrapper */}
      <div className="relative w-full max-w-md">
        
        {/* The Peeping Character - positioned absolutely behind the card */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out pointer-events-none select-none z-0",
            // Cubic bezier bounce when peeking up, fast slide down when hiding
            isPeeking 
              ? "bottom-[calc(100%-8px)] translate-y-0 opacity-100 scale-100" 
              : "bottom-[calc(100%-25px)] translate-y-12 opacity-0 scale-95"
          )}
          style={{
            transitionTimingFunction: isPeeking ? "cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "ease-in",
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
        <div className="relative z-10 w-full rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-slate-400">Sign in to your account</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="name@domain.com"
                  className="w-full bg-white/5 border-white/10 text-white pl-10 pr-4 h-12 focus:border-violet-500/50 focus:ring-violet-500/20"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </Label>
                <a
                  href="#"
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => {
                    setIsPasswordFocused(false);
                    setIsTyping(false);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border-white/10 text-white pl-10 pr-10 h-12 focus:border-violet-500/50 focus:ring-violet-500/20"
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
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                className="border-white/10 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white"
              />
              <Label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer font-normal">
                Remember this device
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-950/40 hover:shadow-violet-950/60 transition-all duration-200"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// demo.tsx
import { LoginPage } from "@/components/ui/peeking-character-login-page";

export default function DemoPage() {
  return <LoginPage />;
}
\`\`\`

Copy-paste these files for dependencies:
\`\`\`tsx
// shadcn/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
\`\`\`
\`\`\`tsx
// shadcn/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
\`\`\`
\`\`\`tsx
// shadcn/checkbox.tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
\`\`\`
\`\`\`tsx
// shadcn/label.tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
\`\`\`

Install NPM dependencies:
\`\`\`bash
lucide-react, @radix-ui/react-slot, class-variance-authority, @radix-ui/react-checkbox, @radix-ui/react-label
\`\`\`

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's arguments and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Use lucide-react icons for SVG symbols or logos`
  },
  {
    id: 'lamp-toggle',
    categoryId: 'components',
    title: 'Desk Lamp Theme Toggle',
    description: 'An interactive desk lamp with a pull-chain switch that toggles between light and dark mode.',
    component: LampToggle,
    tags: ['animated', 'interactive', 'light-mode', 'dark-mode', 'physics', 'toggle'],
    recommendedViewport: { width: 375, height: 667, label: 'Mobile 375\u00d7667', deviceType: 'mobile' },
    prompt: `You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:

\`\`\`tsx
// lamp-toggle.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

// Pull distance threshold and constraints
const PULL_THRESHOLD = 50;
const MAX_PULL = 70;
const CHAIN_REST_LENGTH = 44;

interface DesignProps {
  viewport?: any;
  isFullscreen?: boolean;
  background?: any;
}

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

      oscillator.type = "square";
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
        "flex h-full w-full items-center justify-center overflow-hidden relative select-none",
        "transition-colors duration-700 ease-in-out"
      )}
      style={{
        backgroundColor: isOn ? "#F8F6F1" : "#0C0A14",
      }}
    >
      {/* Ambient background texture */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: isOn ? 0.4 : 0.15,
          backgroundImage: \`radial-gradient(circle at 1px 1px, \${isOn ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'} 1px, transparent 0)\`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Light cone glow - only visible when lamp is on */}
      <div
        className="absolute transition-all duration-700 ease-in-out pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: isOn ? "500px" : "0px",
          height: isOn ? "600px" : "0px",
          opacity: isOn ? 1 : 0,
          background: "conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(255, 220, 120, 0.08) 40%, rgba(255, 200, 80, 0.15) 50%, rgba(255, 220, 120, 0.08) 60%, transparent 70%)",
          borderRadius: "0 0 50% 50%",
          filter: "blur(20px)",
        }}
      />

      {/* Secondary soft glow */}
      <div
        className="absolute transition-all duration-700 ease-in-out pointer-events-none"
        style={{
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: isOn ? "300px" : "0px",
          height: isOn ? "400px" : "0px",
          opacity: isOn ? 0.6 : 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255, 200, 80, 0.2) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Main content area */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Lamp Assembly */}
        <div className="relative flex flex-col items-center">
          {/* Ceiling mount / top anchor bar */}
          <div
            className="w-20 h-2 rounded-b-md transition-colors duration-700"
            style={{
              backgroundColor: isOn ? "#B8B0A0" : "#3A3550",
            }}
          />

          {/* Lamp rod connecting mount to shade */}
          <div
            className="w-1.5 h-10 transition-colors duration-700"
            style={{
              backgroundColor: isOn ? "#9E978A" : "#2E2944",
            }}
          />

          {/* Lamp shade */}
          <div className="relative">
            <svg width="180" height="60" viewBox="0 0 180 60" fill="none" className="block">
              {/* Shade body - a trapezoid shape */}
              <path
                d="M30 0 H150 L175 55 Q175 60 170 60 H10 Q5 60 5 55 Z"
                className="transition-all duration-700"
                fill={isOn ? "#4A4540" : "#252040"}
                stroke={isOn ? "#6B6560" : "#3A3560"}
                strokeWidth="1"
              />
              {/* Inner highlight on the shade */}
              <path
                d="M35 4 H145 L165 52 H15 Z"
                className="transition-all duration-700"
                fill={isOn ? "#555048" : "#2A2548"}
                opacity="0.5"
              />
            </svg>

            {/* Bulb glow halo (visible when on) */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700 pointer-events-none"
              style={{
                width: isOn ? "60px" : "20px",
                height: isOn ? "60px" : "20px",
                background: isOn
                  ? "radial-gradient(circle, rgba(255,220,120,0.9) 0%, rgba(255,200,80,0.4) 40%, transparent 70%)"
                  : "none",
                boxShadow: isOn
                  ? "0 0 40px 15px rgba(255, 200, 80, 0.3), 0 0 80px 30px rgba(255, 200, 80, 0.1)"
                  : "none",
              }}
            />

            {/* The light bulb */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-6 rounded-b-full transition-all duration-500"
              style={{
                backgroundColor: isOn ? "#FFF0C0" : "#1A1830",
                boxShadow: isOn ? "0 4px 20px rgba(255, 200, 80, 0.6)" : "none",
              }}
            />
          </div>

          {/* Pull Chain Assembly */}
          <div className="relative flex flex-col items-center mt-1">
            {/* Chain string - drawn as a thin vertical line that stretches */}
            <div
              className={cn(
                "w-[2px] transition-all origin-top",
                chainSwing ? "animate-pulse" : ""
              )}
              style={{
                height: \`\\\${chainLength}px\`,
                backgroundColor: isOn ? "#9E978A" : "#4A4570",
                transitionDuration: isDragging ? "0ms" : "300ms",
                transitionTimingFunction: isDragging ? "linear" : "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />

            {/* Chain links decoration (small beads along the chain) */}
            {Array.from({ length: Math.floor(chainLength / 12) }, (_, i) => (
              <div
                key={i}
                className="absolute w-[5px] h-[5px] rounded-full transition-colors duration-700"
                style={{
                  top: \`\\\${8 + i * 12}px\`,
                  backgroundColor: isOn ? "#B8B0A0" : "#5A5580",
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
                "relative cursor-grab active:cursor-grabbing touch-none",
                "transition-transform duration-300",
                isDragging ? "scale-110" : "hover:scale-105"
              )}
            >
              {/* Decorative ball at the end of the chain */}
              <div
                className="w-5 h-5 rounded-full transition-all duration-700 shadow-md"
                style={{
                  backgroundColor: isOn ? "#8B8478" : "#5A5580",
                  boxShadow: isDragging
                    ? \`0 0 12px \\\${isOn ? 'rgba(200, 180, 120, 0.5)' : 'rgba(120, 100, 200, 0.5)'}\`
                    : "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />

              {/* Invisible larger hit area for easier grabbing */}
              <div className="absolute -inset-4" />
            </div>
          </div>
        </div>

        {/* Instruction text below the chain */}
        <p
          className="mt-8 text-sm font-medium tracking-wider uppercase transition-colors duration-700"
          style={{
            color: isOn ? "rgba(80, 70, 60, 0.6)" : "rgba(180, 170, 200, 0.4)",
          }}
        >
          Pull to {isOn ? "turn off" : "turn on"}
        </p>

        {/* Demo content card - to showcase the light/dark mode effect */}
        <div
          className="mt-8 w-72 rounded-2xl border p-6 transition-all duration-700 backdrop-blur-sm"
          style={{
            backgroundColor: isOn ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.04)",
            borderColor: isOn ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
            boxShadow: isOn
              ? "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)"
              : "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {/* Card header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-700"
              style={{
                backgroundColor: isOn ? "#FEF3C7" : "#312E81",
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
                className="font-semibold text-sm transition-colors duration-700"
                style={{
                  color: isOn ? "#1C1917" : "#E8E5F0",
                }}
              >
                {isOn ? "Light Mode" : "Dark Mode"}
              </h3>
              <p
                className="text-xs transition-colors duration-700"
                style={{
                  color: isOn ? "#78716C" : "#7C7A90",
                }}
              >
                {isOn ? "Bright and clear" : "Easy on the eyes"}
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
                  width: \`\\\${width}%\`,
                  backgroundColor: isOn ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
                }}
              />
            ))}
          </div>

          {/* Fake action button */}
          <div
            className="mt-5 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-700"
            style={{
              backgroundColor: isOn ? "#1C1917" : "#6366F1",
              color: "#FFFFFF",
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
              color: isOn ? "rgba(80, 70, 60, 0.4)" : "rgba(180, 170, 200, 0.3)",
            }}
          >
            Press{" "}
            <kbd
              className="mx-1 rounded border px-1.5 py-0.5 text-[10px] transition-colors duration-700"
              style={{
                borderColor: isOn ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
                backgroundColor: isOn ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
              }}
            >
              F
            </kbd>{" "}
            for fullscreen
          </div>
        )}
      </div>
    </div>
  );
}
\`\`\`

Now create a demo page that imports and uses this component:

\`\`\`tsx
// demo.tsx
import LampToggle from "@/components/ui/lamp-toggle";

export default function LampToggleDemoPage() {
  return <LampToggle />;
}
\`\`\`

IMPORTANT:

External NPM dependencies used:
- none (lucide-react is optional)

Internal dependencies from shadcn:
- @/lib/utils (for cn utility)

Steps to integrate:
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Ensure @/lib/utils has the cn helper (standard shadcn setup)\``,
  },
];

export function getDesignById(id: string): DesignEntry | undefined {
  return designRegistry.find((design) => design.id === id);
}

export function getDesignsByCategory(categoryId: string): DesignEntry[] {
  return designRegistry.filter((design) => design.categoryId === categoryId);
}

export function getNextDesign(currentId: string): DesignEntry | undefined {
  const currentIndex = designRegistry.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return designRegistry[0];
  const nextIndex = (currentIndex + 1) % designRegistry.length;
  return designRegistry[nextIndex];
}

export function getPreviousDesign(currentId: string): DesignEntry | undefined {
  const currentIndex = designRegistry.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return designRegistry[designRegistry.length - 1];
  const prevIndex = (currentIndex - 1 + designRegistry.length) % designRegistry.length;
  return designRegistry[prevIndex];
}

export function getNextDesignInCategory(currentId: string): DesignEntry | undefined {
  const current = getDesignById(currentId);
  if (!current) return undefined;
  const categoryDesigns = getDesignsByCategory(current.categoryId);
  const currentIndex = categoryDesigns.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return categoryDesigns[0];
  const nextIndex = (currentIndex + 1) % categoryDesigns.length;
  return categoryDesigns[nextIndex];
}

export function getPreviousDesignInCategory(currentId: string): DesignEntry | undefined {
  const current = getDesignById(currentId);
  if (!current) return undefined;
  const categoryDesigns = getDesignsByCategory(current.categoryId);
  const currentIndex = categoryDesigns.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return categoryDesigns[categoryDesigns.length - 1];
  const prevIndex = (currentIndex - 1 + categoryDesigns.length) % categoryDesigns.length;
  return categoryDesigns[prevIndex];
}
