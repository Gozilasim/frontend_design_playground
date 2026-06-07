import { ViewportPreset } from './viewportPresets';
import { LoginPeekingCharacter } from '@/designs/login';

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
  }
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
