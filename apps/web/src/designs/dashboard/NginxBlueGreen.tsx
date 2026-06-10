'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Server,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Code,
  Info,
  Activity,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesignProps } from '@/data/designRegistry';

interface Particle {
  id: number;
  delay: number;
  pathId: string;
}

export default function NginxBlueGreen({ viewport }: DesignProps) {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [activeTab, setActiveTab] = useState<'config' | 'explanation'>('config');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [reqCount, setReqCount] = useState<number>(1142);
  const [logs, setLogs] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [reloadCommandPulse, setReloadCommandPulse] = useState<boolean>(false);
  const [reloadBurst, setReloadBurst] = useState<boolean>(false);
  const [whiteFlash, setWhiteFlash] = useState<boolean>(false);
  // Track ticks during Step 1 to drain green logs after first few ticks
  const [step1Ticks, setStep1Ticks] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isVertical = viewport.deviceType === 'mobile' || viewport.deviceType === 'shorts';

  // Sound effects generator using Web Audio API
  const playSound = useCallback((type: 'click' | 'reload' | 'success') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'reload') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio fallback
    }
  }, []);

  // Update mock request counter & add access logs
  useEffect(() => {
    if (!isPlaying) return;

    logTimerRef.current = setInterval(() => {
      setReqCount((prev) => prev + 1);

      const time = new Date().toLocaleTimeString();
      const ip = `192.168.1.${Math.floor(Math.random() * 80) + 10}`;
      const status = '200';
      const path = '/api/v1/resource';

      let upstream = 'connection: new -> green_server';
      if (activeStep === 2) {
        upstream = 'connection: new -> blue_server';
      } else if (activeStep === 1) {
        // Fix 8: During reload, ALL new connections go to Blue.
        // Only the first 1-2 ticks show draining green for existing connections.
        setStep1Ticks((prev) => prev + 1);
        if (step1Ticks < 2) {
          upstream = 'connection: existing -> green_server (draining)';
        } else {
          upstream = 'connection: new -> blue_server (new worker)';
        }
      }

      const newLog = `[${time}] ${ip} - GET ${path} - ${status} - ${upstream}`;
      setLogs((prev) => [newLog, ...prev.slice(0, 2)]);
    }, 900);

    return () => {
      if (logTimerRef.current) clearInterval(logTimerRef.current);
    };
  }, [isPlaying, activeStep, step1Ticks]);

  // Handle auto playback sequence
  useEffect(() => {
    if (!isPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setActiveStep((current) => {
        if (current === 0) {
          setIsReloading(true);
          setReloadCommandPulse(true);
          setReloadBurst(true);
          setWhiteFlash(true);
          setStep1Ticks(0);
          playSound('reload');
          setTimeout(() => {
            setIsReloading(false);
            setReloadCommandPulse(false);
            setReloadBurst(false);
          }, 1500);
          setTimeout(() => setWhiteFlash(false), 50);
          return 1;
        } else if (current === 1) {
          setShowSuccess(true);
          playSound('success');
          setTimeout(() => setShowSuccess(false), 3000);
          return 2;
        } else {
          return 0;
        }
      });
    }, 5500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying, playSound]);

  const handleStepSelect = (step: 0 | 1 | 2) => {
    playSound('click');
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setIsPlaying(false);

    if (step === 1) {
      setIsReloading(true);
      setReloadCommandPulse(true);
      setReloadBurst(true);
      setWhiteFlash(true);
      setStep1Ticks(0);
      playSound('reload');
      setTimeout(() => {
        setIsReloading(false);
        setReloadCommandPulse(false);
        setReloadBurst(false);
      }, 1500);
      setTimeout(() => setWhiteFlash(false), 50);
    } else if (step === 2) {
      setShowSuccess(true);
      playSound('success');
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setActiveStep(step);
  };

  const resetAnimation = () => {
    playSound('click');
    setActiveStep(0);
    setStep1Ticks(0);
    setReloadBurst(false);
    setWhiteFlash(false);
    setIsPlaying(true);
  };

  // Particle setup
  const clientPaths = ['client-p1', 'client-p2', 'client-p3'];
  const particles: Particle[] = [];
  for (let i = 0; i < 9; i++) {
    particles.push({
      id: i,
      delay: i * 0.45,
      pathId: clientPaths[i % 3],
    });
  }

  const getLineHighlightClass = (lineNumber: number) => {
    if (activeStep === 0 && lineNumber === 12) {
      return 'bg-emerald-500/15 border-l-2 border-emerald-500 text-emerald-400 font-semibold';
    }
    if (activeStep === 2 && lineNumber === 12) {
      return 'bg-blue-500/15 border-l-2 border-blue-500 text-blue-400 font-semibold';
    }
    if (activeStep === 1 && (lineNumber === 11 || lineNumber === 12)) {
      return 'bg-amber-500/15 border-l-2 border-amber-500 text-amber-400 font-semibold';
    }
    return '';
  };

  const activeProxyPass =
    activeStep === 0
      ? '        proxy_pass http://green_backend; # ACTIVE (v1.0.0)'
      : activeStep === 1
        ? '        proxy_pass http://blue_backend; # SWITCHING (v2.0.0)'
        : '        proxy_pass http://blue_backend; # ACTIVE (v2.0.0)';

  return (
    <div className="relative flex h-full w-full select-none flex-col items-center justify-center overflow-hidden bg-[#070913] p-4 font-sans text-slate-100">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute left-10 top-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-96 w-96 rounded-full bg-blue-500/5 blur-[140px]" />

      {/* White flash overlay on reload */}
      {whiteFlash && (
        <div
          className="pointer-events-none absolute inset-0 z-40 bg-white/15"
          style={{
            animation: 'flash 50ms ease-out forwards',
          }}
        />
      )}
      <style jsx>{`
        @keyframes flash {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Main centered container */}
      <div className="flex w-full max-w-4xl flex-grow flex-col justify-center">
        {/* Header Panel */}
        <div className="mb-2 flex flex-shrink-0 items-center justify-between border-b border-white/5 pb-2">
          <div>
            <h1 className="bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-400 bg-clip-text text-base font-bold tracking-tight text-transparent">
              Nginx Blue-Green Deployment Visualizer
            </h1>
            <p className="text-[10px] text-slate-400">
              Zero-downtime traffic switching animation demo
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm transition-all',
                isPlaying
                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              )}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" /> Pause Auto
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" /> Auto Loop
                </>
              )}
            </button>
            <button
              onClick={resetAnimation}
              className="rounded-lg border border-white/10 bg-white/5 p-1 text-slate-300 transition-all hover:bg-white/10"
              title="Reset"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>
        {/* Premium CI/CD Pipeline Timeline Stepper */}
        <div className="mb-3 flex flex-shrink-0 select-none flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-950/35 p-4 backdrop-blur-md">
          {/* Node Circles and Progress Line Row */}
          <div className="relative flex h-10 items-center justify-between px-10">
            {/* Connection Line Container (Spans exactly from Node 1 center to Node 3 center) */}
            <div className="pointer-events-none absolute left-[88px] right-[88px] top-1/2 z-0 h-[2.5px] -translate-y-1/2">
              {/* Background Line */}
              <div className="absolute inset-0 rounded-full bg-slate-800/80" />

              {/* Active Animated Progress Line (Single fluid line flowing left-to-right) */}
              <div
                className={cn(
                  'absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out',
                  activeStep === 0 && 'bg-emerald-500',
                  activeStep === 1 && 'bg-gradient-to-r from-emerald-500 to-amber-500',
                  activeStep === 2 && 'bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500'
                )}
                style={{
                  width: activeStep === 0 ? '0%' : activeStep === 1 ? '50%' : '100%',
                }}
              />
            </div>

            {[
              {
                step: 0 as const,
                icon: Server,
                color: 'emerald',
                activeClass:
                  'border-emerald-500 text-emerald-400 bg-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
              },
              {
                step: 1 as const,
                icon: RefreshCw,
                color: 'amber',
                activeClass:
                  'border-amber-500 text-amber-400 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
              },
              {
                step: 2 as const,
                icon: CheckCircle2,
                color: 'blue',
                activeClass:
                  'border-blue-500 text-blue-400 bg-blue-950/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
              },
            ].map((item) => {
              const isActive = activeStep === item.step;
              const isCompleted = activeStep > item.step;
              const Icon = item.icon;

              return (
                <button
                  key={item.step}
                  onClick={() => handleStepSelect(item.step)}
                  className="relative z-10 flex w-24 justify-center focus:outline-none"
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 bg-slate-950 transition-all duration-500',
                      isActive
                        ? item.activeClass
                        : isCompleted
                          ? 'border-emerald-500/60 text-emerald-400'
                          : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400'
                    )}
                  >
                    {isActive && (
                      <span
                        className={cn(
                          'pointer-events-none absolute -inset-1 animate-ping rounded-full border border-current opacity-35',
                          item.color === 'emerald' && 'text-emerald-400',
                          item.color === 'amber' && 'text-amber-400',
                          item.color === 'blue' && 'text-blue-400'
                        )}
                      />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-all duration-300',
                        isActive && item.color === 'amber' && 'animate-spin'
                      )}
                      style={{ animationDuration: '3.5s' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Labels Row */}
          <div className="mt-2.5 flex justify-between px-10">
            {[
              {
                step: 0 as const,
                label: '1. Production Green',
                desc: 'Traffic to v1.0.0',
                textActive: 'text-emerald-400',
              },
              {
                step: 1 as const,
                label: '2. Switch Traffic',
                desc: 'nginx -s reload',
                textActive: 'text-amber-400',
              },
              {
                step: 2 as const,
                label: '3. Active Blue',
                desc: 'Traffic to v2.0.0',
                textActive: 'text-blue-400',
              },
            ].map((item) => {
              const isActive = activeStep === item.step;
              const isCompleted = activeStep > item.step;

              return (
                <button
                  key={item.step}
                  onClick={() => handleStepSelect(item.step)}
                  className="group flex w-24 flex-col items-center text-center focus:outline-none"
                >
                  <span
                    className={cn(
                      'text-[9.5px] font-bold leading-tight transition-colors duration-300',
                      isActive
                        ? item.textActive
                        : isCompleted
                          ? 'text-slate-300'
                          : 'text-slate-500 group-hover:text-slate-400'
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block max-w-full truncate font-mono text-[7.5px] text-slate-500">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Canvas Topology Flow Container */}
        <div
          className={cn(
            'relative flex flex-grow select-none items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-slate-950/40',
            isVertical ? 'max-h-[480px] min-h-[340px]' : 'max-h-[420px] min-h-[300px]'
          )}
        >
          {/* Unified Responsive SVG */}
          <svg
            className="h-full w-full"
            viewBox={isVertical ? '0 0 360 340' : '0 0 920 300'}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="gradient-grey" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Topology flow paths (Desktop layout) */}
            {!isVertical && (
              <>
                {/* Clients to Nginx Paths */}
                <path
                  id="client-p1"
                  d="M 160 80 C 270 80, 270 150, 390 150"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.5"
                />
                <path
                  id="client-p2"
                  d="M 160 150 H 390"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.5"
                />
                <path
                  id="client-p3"
                  d="M 160 220 C 270 220, 270 150, 390 150"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.5"
                />

                {/* Nginx to Green Path */}
                <path
                  id="nginx-to-green"
                  d="M 530 150 C 610 150, 650 82, 740 82"
                  fill="none"
                  className="transition-all duration-700"
                  stroke={activeStep === 0 ? 'url(#gradient-green)' : 'url(#gradient-grey)'}
                  strokeWidth={activeStep === 0 ? '2.5' : activeStep === 1 ? '0.8' : '0.5'}
                  strokeOpacity={activeStep === 0 ? 1 : activeStep === 1 ? 0.25 : 0.15}
                />

                {/* Nginx to Blue Path */}
                <path
                  id="nginx-to-blue"
                  d="M 530 150 C 610 150, 650 217, 740 217"
                  fill="none"
                  className="transition-all duration-700"
                  stroke={activeStep >= 1 ? 'url(#gradient-blue)' : 'url(#gradient-grey)'}
                  strokeWidth={activeStep === 2 ? '2.5' : activeStep === 1 ? '2.2' : '0.5'}
                  strokeOpacity={activeStep === 2 ? 1 : activeStep === 1 ? 0.85 : 0.15}
                />
              </>
            )}

            {/* Topology flow paths (Vertical Mobile / Shorts layout) */}
            {isVertical && (
              <>
                {/* Clients to Nginx Paths */}
                <path
                  id="client-p1"
                  d="M 60 35 C 60 85, 180 85, 180 125"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.5"
                />
                <path
                  id="client-p2"
                  d="M 180 35 V 125"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.5"
                />
                <path
                  id="client-p3"
                  d="M 300 35 C 300 85, 180 85, 180 125"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1.5"
                />

                {/* Nginx to Green Path */}
                <path
                  id="nginx-to-green"
                  d="M 180 215 C 180 235, 90 235, 90 255"
                  fill="none"
                  className="transition-all duration-700"
                  stroke={activeStep === 0 ? 'url(#gradient-green)' : 'url(#gradient-grey)'}
                  strokeWidth={activeStep === 0 ? '2.5' : activeStep === 1 ? '0.8' : '0.5'}
                  strokeOpacity={activeStep === 0 ? 1 : activeStep === 1 ? 0.25 : 0.15}
                />

                {/* Nginx to Blue Path */}
                <path
                  id="nginx-to-blue"
                  d="M 180 215 C 180 235, 270 235, 270 255"
                  fill="none"
                  className="transition-all duration-700"
                  stroke={activeStep >= 1 ? 'url(#gradient-blue)' : 'url(#gradient-grey)'}
                  strokeWidth={activeStep === 2 ? '2.5' : activeStep === 1 ? '2.2' : '0.5'}
                  strokeOpacity={activeStep === 2 ? 1 : activeStep === 1 ? 0.85 : 0.15}
                />
              </>
            )}

            {/* Flowing animated request particles */}
            {isPlaying && (
              <>
                {/* Client -> Nginx Traffic Flow */}
                {particles.map((p) => (
                  <circle
                    key={`in-${p.id}`}
                    r="3"
                    fill="#38bdf8"
                    className="drop-shadow-[0_0_4px_#38bdf8] filter"
                  >
                    <animateMotion
                      dur="2.2s"
                      repeatCount="indefinite"
                      path={
                        p.pathId === 'client-p1'
                          ? isVertical
                            ? 'M 60 35 C 60 85, 180 85, 180 125'
                            : 'M 160 80 C 270 80, 270 150, 390 150'
                          : p.pathId === 'client-p2'
                            ? isVertical
                              ? 'M 180 35 V 125'
                              : 'M 160 150 H 390'
                            : isVertical
                              ? 'M 300 35 C 300 85, 180 85, 180 125'
                              : 'M 160 220 C 270 220, 270 150, 390 150'
                      }
                      begin={`${p.delay}s`}
                    />
                  </circle>
                ))}

                {/* Nginx -> Green (v1) Traffic Flow — Step 0 only */}
                {activeStep === 0 &&
                  particles.slice(0, 5).map((p) => (
                    <circle
                      key={`g-${p.id}`}
                      r="3"
                      fill="#10b981"
                      className="drop-shadow-[0_0_5px_#10b981] filter"
                    >
                      <animateMotion
                        dur="1.6s"
                        repeatCount="indefinite"
                        path={
                          isVertical
                            ? 'M 180 215 C 180 235, 90 235, 90 255'
                            : 'M 530 150 C 610 150, 650 82, 740 82'
                        }
                        begin={`${p.delay * 0.7}s`}
                      />
                    </circle>
                  ))}

                {/* Nginx -> Blue (v2) Traffic Flow — Step 2 only */}
                {activeStep === 2 &&
                  particles.slice(0, 5).map((p) => (
                    <circle
                      key={`b-${p.id}`}
                      r="3"
                      fill="#3b82f6"
                      className="drop-shadow-[0_0_5px_#3b82f6] filter"
                    >
                      <animateMotion
                        dur="1.6s"
                        repeatCount="indefinite"
                        path={
                          isVertical
                            ? 'M 180 215 C 180 235, 270 235, 270 255'
                            : 'M 530 150 C 610 150, 650 217, 740 217'
                        }
                        begin={`${p.delay * 0.7}s`}
                      />
                    </circle>
                  ))}

                {/* Fix 3: Step 1 Reload — ALL new traffic goes to Blue */}
                {activeStep === 1 && (
                  <>
                    {/* Blue burst particles — first 3 burst from Nginx node with stagger */}
                    {particles.slice(0, 3).map((p, idx) => (
                      <circle
                        key={`blue-burst-${p.id}`}
                        r="3.5"
                        fill="#3b82f6"
                        className="drop-shadow-[0_0_6px_#3b82f6] filter"
                      >
                        <animateMotion
                          dur="1.4s"
                          repeatCount="indefinite"
                          path={
                            isVertical
                              ? 'M 180 215 C 180 235, 270 235, 270 255'
                              : 'M 530 150 C 610 150, 650 217, 740 217'
                          }
                          begin={`${idx * 0.12}s`}
                        />
                        <animate
                          attributeName="r"
                          from="4"
                          to="3"
                          dur="0.5s"
                          begin={`${idx * 0.12}s`}
                          fill="freeze"
                        />
                        <animate
                          attributeName="opacity"
                          from="1"
                          to="0.8"
                          dur="0.5s"
                          begin={`${idx * 0.12}s`}
                          fill="freeze"
                        />
                      </circle>
                    ))}
                    {/* Remaining blue particles — normal continuous flow */}
                    {particles.slice(3, 6).map((p) => (
                      <circle
                        key={`new-blue-${p.id}`}
                        r="3"
                        fill="#3b82f6"
                        className="drop-shadow-[0_0_5px_#3b82f6] filter"
                      >
                        <animateMotion
                          dur="1.5s"
                          repeatCount="indefinite"
                          path={
                            isVertical
                              ? 'M 180 215 C 180 235, 270 235, 270 255'
                              : 'M 530 150 C 610 150, 650 217, 740 217'
                          }
                          begin={`${p.delay * 0.55}s`}
                        />
                      </circle>
                    ))}
                  </>
                )}

                {/* Fix 3: Step 1 — Enhanced green drain particles (NOT looping) */}
                {activeStep === 1 &&
                  particles.slice(0, 5).map((p, idx) => (
                    <g key={`drain-${p.id}`}>
                      {/* Trailing path indicator */}
                      <path
                        d={
                          isVertical
                            ? 'M 180 215 C 180 235, 90 235, 90 255'
                            : 'M 530 150 C 610 150, 650 82, 740 82'
                        }
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="4,6"
                        opacity="0.3"
                      >
                        <animate
                          attributeName="strokeDashoffset"
                          from="0"
                          to="-40"
                          dur="2s"
                          begin={`${p.delay * 0.25}s`}
                          fill="freeze"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.3"
                          to="0"
                          dur="2s"
                          begin={`${p.delay * 0.25}s`}
                          fill="freeze"
                        />
                      </path>
                      {/* Drain particle with size shrink */}
                      <circle
                        r="3"
                        fill="#10b981"
                        opacity="1"
                        className="drop-shadow-[0_0_4px_#10b981] filter"
                      >
                        <animateMotion
                          dur="2s"
                          repeatCount="1"
                          fill="freeze"
                          path={
                            isVertical
                              ? 'M 180 215 C 180 235, 90 235, 90 255'
                              : 'M 530 150 C 610 150, 650 82, 740 82'
                          }
                          begin={`${p.delay * 0.25}s`}
                        />
                        <animate
                          attributeName="opacity"
                          from="1"
                          to="0"
                          dur="2s"
                          begin={`${p.delay * 0.25}s`}
                          fill="freeze"
                        />
                        <animate
                          attributeName="r"
                          from="3"
                          to="0.5"
                          dur="2s"
                          begin={`${p.delay * 0.25}s`}
                          fill="freeze"
                        />
                      </circle>
                    </g>
                  ))}

                {/* Reload burst particles from Nginx node */}
                {reloadBurst && (
                  <g>
                    {/* Expanding ring */}
                    <circle
                      cx={isVertical ? 180 : 530}
                      cy={isVertical ? 215 : 150}
                      r="5"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      fill="none"
                      opacity="0.9"
                    >
                      <animate attributeName="r" from="5" to="50" dur="0.7s" fill="freeze" />
                      <animate attributeName="opacity" from="0.9" to="0" dur="0.7s" fill="freeze" />
                      <animate
                        attributeName="strokeWidth"
                        from="2.5"
                        to="0.5"
                        dur="0.7s"
                        fill="freeze"
                      />
                    </circle>
                    {/* Radial burst particles */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <circle key={`burst-${i}`} r="2.5" fill="#fbbf24" opacity="0.9">
                        <animateMotion
                          path={
                            isVertical
                              ? `M 180 215 L ${180 + 55 * Math.cos((i * 36 * Math.PI) / 180)} ${215 + 55 * Math.sin((i * 36 * Math.PI) / 180)}`
                              : `M 530 150 L ${530 + 55 * Math.cos((i * 36 * Math.PI) / 180)} ${150 + 55 * Math.sin((i * 36 * Math.PI) / 180)}`
                          }
                          dur="0.6s"
                          fill="freeze"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.9"
                          to="0"
                          dur="0.6s"
                          fill="freeze"
                        />
                        <animate attributeName="r" from="2.5" to="0.5" dur="0.6s" fill="freeze" />
                      </circle>
                    ))}
                  </g>
                )}
              </>
            )}

            {/* HTML cards embedded directly into SVG via foreignObject */}

            {/* 1. Client Card List */}
            {!isVertical ? (
              <foreignObject x="20" y="50" width="140" height="200">
                <div className="flex h-full flex-col justify-center gap-3">
                  {['Web User', 'Mobile App', 'API Client'].map((label, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-slate-900/90 px-3 py-2.5 shadow-inner"
                    >
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                      <span className="font-mono text-[10px] font-bold text-slate-300">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </foreignObject>
            ) : (
              <foreignObject x="10" y="15" width="340" height="40">
                <div className="flex h-full items-center justify-around">
                  {['Web User', 'Mobile App', 'API Client'].map((label, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-900/90 px-2.5 py-1.5 shadow-inner"
                    >
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                      <span className="font-mono text-[9px] font-bold text-slate-300">{label}</span>
                    </div>
                  ))}
                </div>
              </foreignObject>
            )}

            {/* Success banner above NGINX — tall slot + bottom align keeps bounce inside bounds */}
            {showSuccess && (
              <foreignObject
                x={isVertical ? 10 : 250}
                y={isVertical ? 68 : 38}
                width={isVertical ? 340 : 420}
                height={isVertical ? 58 : 68}
              >
                <div className="flex h-full w-full flex-col justify-end">
                  <div className="flex w-full animate-bounce items-center gap-1.5 rounded-xl border border-blue-400 bg-blue-600/95 px-2.5 py-1.5 font-sans text-white shadow-[0_0_16px_rgba(59,130,246,0.3)] backdrop-blur-md">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-sky-300" />
                    <span className="text-[8.5px] font-semibold leading-tight">
                      All new traffic now routes to Blue. Green draining complete.
                    </span>
                  </div>
                </div>
              </foreignObject>
            )}

            {/* 2. Nginx Load Balancer Node */}
            <foreignObject
              x={isVertical ? '110' : '390'}
              y={isVertical ? '125' : '105'}
              width="140"
              height="90"
            >
              <div
                className={cn(
                  'flex h-full flex-col items-center justify-center rounded-2xl border bg-slate-900/90 shadow-xl backdrop-blur-md transition-all duration-300',
                  isReloading
                    ? 'scale-105 border-amber-500/60 shadow-amber-500/10'
                    : 'border-white/10'
                )}
              >
                {isReloading && (
                  <div className="pointer-events-none absolute inset-0 animate-ping rounded-2xl border-2 border-amber-500/60 opacity-60" />
                )}
                <div className="mb-0.5 flex items-center gap-1.5 text-slate-300">
                  <RefreshCw
                    className={cn('h-3.5 w-3.5 text-sky-400', isReloading && 'animate-spin')}
                  />
                  <span className="font-mono text-[11px] font-bold tracking-wider">NGINX</span>
                </div>
                <span className="font-mono text-[7.5px] uppercase tracking-wider text-slate-500">
                  Proxy Engine
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="font-mono text-[8.5px] text-slate-400">Active</span>
                </div>
              </div>
            </foreignObject>

            {/* 3. Server Targets */}
            {/* Green Server */}
            <foreignObject
              x={isVertical ? '15' : '740'}
              y={isVertical ? '255' : '45'}
              width="160"
              height="70"
            >
              <div
                className={cn(
                  'flex h-full flex-col justify-center rounded-xl border bg-slate-900/95 px-3 transition-all duration-500',
                  activeStep === 0
                    ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                    : activeStep === 1
                      ? 'border-amber-500/30 opacity-60'
                      : 'border-white/5 opacity-40'
                )}
              >
                <div className="flex items-center justify-between">
                  <Server className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="py-0.2 rounded bg-emerald-500/10 px-1.5 font-mono text-[7.5px] font-bold text-emerald-400">
                    v1.0.0
                  </span>
                </div>
                <span className="mt-1 text-[9.5px] font-bold text-slate-200">Green Cluster</span>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'h-1 w-1 rounded-full',
                      activeStep === 0
                        ? 'animate-pulse bg-emerald-500'
                        : activeStep === 1
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                    )}
                  />
                  <span className="font-mono text-[8.5px] text-slate-400">
                    {activeStep === 0 ? 'Active' : activeStep === 1 ? 'Draining' : 'Standby'}
                  </span>
                </div>
              </div>
            </foreignObject>

            {/* Blue Server */}
            <foreignObject
              x={isVertical ? '185' : '740'}
              y={isVertical ? '255' : '180'}
              width="160"
              height="70"
            >
              <div
                className={cn(
                  'flex h-full flex-col justify-center rounded-xl border bg-slate-900/95 px-3 transition-all duration-500',
                  activeStep === 2
                    ? 'border-blue-500/40 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20'
                    : activeStep === 1
                      ? 'border-blue-500/30 opacity-80 shadow-md shadow-blue-500/5'
                      : // Fix 2: Step 0 — amber deploying pulse border
                        'border-amber-500/20 opacity-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <Server className="h-3.5 w-3.5 text-blue-400" />
                  <span className="py-0.2 rounded bg-blue-500/10 px-1.5 font-mono text-[7.5px] font-bold text-blue-400">
                    v2.0.0
                  </span>
                </div>
                <span className="mt-1 text-[9.5px] font-bold text-slate-200">Blue Cluster</span>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'h-1 w-1 rounded-full',
                      activeStep === 2
                        ? 'animate-pulse bg-blue-500'
                        : activeStep === 1
                          ? 'animate-pulse bg-blue-500'
                          : // Fix 1 & 2: Step 0 — amber pulse for deploying
                            'animate-pulse bg-amber-500'
                    )}
                  />
                  <span className="font-mono text-[8.5px] text-slate-400">
                    {activeStep >= 1
                      ? 'Active'
                      : // Fix 1: Step 0 label — was "Ready", now "Deploying"
                        'Deploying'}
                  </span>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
    </div>
  );
}
