'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, Globe, Shield, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesignProps } from '@/data/designRegistry';

type PacketPos = 'frontend' | 'browser' | 'backend';
type PacketState = 'idle' | 'request' | 'success' | 'blocked';
type Stage = 1 | 2;

interface LogEntry {
  id: number;
  text: string;
  highlight?: 'success' | 'danger' | 'warning';
}

function LogLine({ entry }: { entry: LogEntry }) {
  const colorClass =
    entry.highlight === 'success' ? 'text-[#10b981]'
    : entry.highlight === 'danger' ? 'text-[#f43f5e]'
    : entry.highlight === 'warning' ? 'text-[#f59e0b]'
    : '';
  return (
    <div className="flex mb-1">
      <span className="text-[#38bdf8] mr-2 select-none">$</span>
      <span className={colorClass}>{entry.text}</span>
    </div>
  );
}

export default function CorsAllowedOrigins({ viewport }: DesignProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStage, setCurrentStage] = useState<Stage>(1);
  const [packetPos, setPacketPos] = useState<PacketPos>('frontend');
  const [packetState, setPacketState] = useState<PacketState>('idle');
  const [frontendState, setFrontendState] = useState<'default' | 'success' | 'danger'>('default');
  const [browserState, setBrowserState] = useState<'default' | 'success' | 'danger'>('default');
  const [backendState, setBackendState] = useState<'default' | 'success' | 'danger'>('default');
  const [boardShaking, setBoardShaking] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [step1Active, setStep1Active] = useState<boolean>(false);
  const [step2Active, setStep2Active] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopRequestedRef = useRef<boolean>(false);
  const logIdRef = useRef<number>(0);
  const stageRef = useRef<Stage>(1);

  const isVertical = viewport.deviceType === 'mobile' || viewport.deviceType === 'shorts';

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const addLog = useCallback((text: string, highlight?: 'success' | 'danger' | 'warning') => {
    logIdRef.current += 1;
    setLogs([{ id: logIdRef.current, text, highlight }]);
  }, []);

  const playSound = useCallback((type: 'success' | 'error' | 'click') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // Audio fallback
    }
  }, []);

  const resetBoardState = useCallback(() => {
    setPacketState('idle');
    setPacketPos('frontend');
    setFrontendState('default');
    setBrowserState('default');
    setBackendState('default');
    setBoardShaking(false);
    setStep1Active(false);
    setStep2Active(false);
  }, []);

  const runStageOne = useCallback(async () => {
    setStep1Active(true);
    addLog('STAGE 1 START: Client at [trusted-app.com] requests secured API resources.');

    setPacketState('request');
    setPacketPos('frontend');
    await delay(200);

    addLog('Client script triggers HTTP request. Browser intercepts to attach safety headers.');
    setPacketPos('browser');
    await delay(1200);

    addLog('Browser appends Origin headers. Dispatching packet to [api.server.com].');
    setPacketPos('backend');
    await delay(1200);

    addLog('Server processes request. Compiling response and defining allowed permissions.');
    await delay(1200);

    setPacketState('success');
    addLog('Server responds! Attaches: Access-Control-Allow-Origin: https://trusted-app.com');
    setPacketPos('browser');
    await delay(1500);

    addLog('Browser verifies Access-Control policies...');
    await delay(1000);

    setBrowserState('success');
    playSound('success');
    addLog('Success: Request Origin matches Allowed Origins list. Releasing sandbox hold.', 'success');
    await delay(1200);

    setPacketPos('frontend');
    await delay(1000);
    setFrontendState('success');
    addLog('Pipeline Clear. Client application successfully reads API response.', 'success');
    await delay(1500);

    setPacketState('idle');
  }, [addLog, playSound]);

  const runStageTwo = useCallback(async () => {
    setStep2Active(true);
    addLog('STAGE 2 START: Host at [malicious-site.xyz] attempts cross-origin connection.', 'warning');

    setPacketState('request');
    setPacketPos('frontend');
    await delay(200);

    addLog('Malicious script triggers API call. Browser monitors packet.');
    setPacketPos('browser');
    await delay(1200);

    addLog('Packet sent to target server. Same-Origin policies enforce validation.');
    setPacketPos('backend');
    await delay(1200);

    addLog('Server processes request, returning standard execution permissions.');
    await delay(1200);

    setPacketState('blocked');
    addLog('Server outputs: Access-Control-Allow-Origin configured for trusted-app.com only.');
    setPacketPos('browser');
    await delay(1500);

    addLog('Security Sandbox: Comparing Request Host vs Access-Control settings...');
    await delay(1200);

    setBrowserState('danger');
    setBoardShaking(true);
    playSound('error');
    addLog('CRITICAL: Origin [malicious-site.xyz] not in Server permissions list!', 'danger');
    await delay(500);
    setBoardShaking(false);

    addLog('CORS Error: Browser blocks script execution and drops payload.', 'danger');
    await delay(1000);

    setPacketState('idle');
    setFrontendState('danger');
    await delay(2000);
  }, [addLog, playSound]);

  useEffect(() => {
    if (!isPlaying) {
      stopRequestedRef.current = true;
      return;
    }

    stopRequestedRef.current = false;
    let mounted = true;

    const run = async () => {
      while (mounted && !stopRequestedRef.current) {
        resetBoardState();

        if (stageRef.current === 1) {
          setCurrentStage(1);
          setStep1Active(false);
          setStep2Active(false);
          await runStageOne();
        } else {
          setCurrentStage(2);
          setStep1Active(false);
          setStep2Active(false);
          await runStageTwo();
        }

        if (mounted && !stopRequestedRef.current) {
          await delay(3000);
          stageRef.current = stageRef.current === 1 ? 2 : 1;
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [isPlaying, resetBoardState, runStageOne, runStageTwo]);

  const handleTogglePlay = () => {
    playSound('click');
    setIsPlaying(!isPlaying);
  };

  const handleSkipStage = () => {
    playSound('click');
    stopRequestedRef.current = true;
    resetBoardState();
    stageRef.current = stageRef.current === 1 ? 2 : 1;
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  const packetStyle = (() => {
    if (isVertical) {
      if (packetPos === 'frontend') return { left: 'calc(50% - 60px)', top: 'calc(16.67% - 24px)' };
      if (packetPos === 'browser') return { left: 'calc(50% - 60px)', top: 'calc(50% - 24px)' };
      return { left: 'calc(50% - 60px)', top: 'calc(83.33% - 24px)' };
    }
    if (packetPos === 'frontend') return { left: '75px', top: '136px' };
    if (packetPos === 'browser') return { left: 'calc(50% - 60px)', top: '136px' };
    return { left: 'calc(100% - 195px)', top: '136px' };
  })();

  const packetLabel = packetState === 'success' || packetState === 'blocked' ? 'HTTP 200 OK' : 'HTTP GET';

  const packetSubtext = packetState === 'success'
    ? 'Allow-Origin: trusted-app.com'
    : packetState === 'blocked'
      ? 'Allow-Origin: trusted-app.com'
      : currentStage === 1
        ? 'Origin: trusted-app.com'
        : 'Origin: malicious-site.xyz';

  const packetBorderColor = packetState === 'success'
    ? 'var(--color-success, #10b981)'
    : packetState === 'blocked'
      ? 'var(--color-danger, #f43f5e)'
      : 'var(--color-primary, #38bdf8)';

  const packetShadow = packetState === 'success'
    ? '0 10px 25px rgba(16, 185, 129, 0.2)'
    : packetState === 'blocked'
      ? '0 10px 25px rgba(244, 63, 94, 0.2)'
      : '0 10px 25px rgba(56, 189, 248, 0.2)';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden font-sans p-4 relative select-none" style={{ backgroundColor: '#090d16', color: '#f3f4f6' }}>
      <div className="absolute pointer-events-none" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, rgba(0,0,0,0) 70%)', top: '10%', left: '15%' }} />
      <div className="absolute pointer-events-none" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0) 70%)', bottom: '10%', right: '10%' }} />

      <div className="relative z-10 w-full max-w-[900px] flex flex-col gap-5">
        <div className="flex items-center justify-center gap-3">
          <button onClick={handleTogglePlay} className="px-4 py-2.5 rounded-[10px] text-[12px] font-medium flex items-center gap-2 transition-all hover:bg-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{isPlaying ? 'Autoplay Running' : 'Autoplay Paused'}</span>
          </button>
          <button onClick={handleSkipStage} className="px-4 py-2.5 rounded-[10px] text-[12px] font-medium flex items-center gap-2 transition-all hover:bg-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span>Skip Stage</span>
            <SkipForward className="h-3 w-3" />
          </button>
        </div>

        <header className="text-center">
          <h1 className="text-[28px] font-bold tracking-tight mb-2" style={{ background: 'linear-gradient(135deg, #fff 0%, #a5f3fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cross-Origin Resource Sharing (CORS)
          </h1>
          <p className="text-[14px] max-w-[500px] mx-auto leading-relaxed" style={{ color: '#9ca3af' }}>
            A visual walkthrough of the security handshakes governing modern web architectures.
          </p>
        </header>

        <div className="flex w-fit mx-auto rounded-full p-1.5 backdrop-blur-lg" style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => {
              playSound('click');
              stopRequestedRef.current = true;
              resetBoardState();
              stageRef.current = 1;
              setTimeout(() => setIsPlaying(true), 100);
            }}
            className={cn('px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-400 flex items-center gap-2', step1Active ? 'bg-white/[0.08] text-white shadow-md' : 'text-[#9ca3af] hover:text-white')}
          >
            <span className={cn('inline-flex w-[18px] h-[18px] rounded-full items-center justify-center text-[10px] font-bold transition-colors', step1Active ? 'bg-[#10b981] text-black' : 'bg-white/10')}>1</span>
            <span className={isVertical ? 'hidden sm:inline' : ''}>Trusted Origin</span>
            <span className={isVertical ? 'sm:hidden' : 'hidden'}>Trusted</span>
          </button>
          <button
            onClick={() => {
              playSound('click');
              stopRequestedRef.current = true;
              resetBoardState();
              stageRef.current = 2;
              setTimeout(() => setIsPlaying(true), 100);
            }}
            className={cn('px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-400 flex items-center gap-2', step2Active ? 'bg-white/[0.08] text-white shadow-md' : 'text-[#9ca3af] hover:text-white')}
          >
            <span className={cn('inline-flex w-[18px] h-[18px] rounded-full items-center justify-center text-[10px] font-bold transition-colors', step2Active ? 'bg-[#f43f5e] text-white' : 'bg-white/10')}>2</span>
            <span className={isVertical ? 'hidden sm:inline' : ''}>Untrusted Origin</span>
            <span className={isVertical ? 'sm:hidden' : 'hidden'}>Untrusted</span>
          </button>
        </div>

        <div
          className={cn('relative rounded-[20px] flex justify-between items-center backdrop-blur-xl overflow-hidden', isVertical ? 'h-[380px] px-6 flex-col justify-around' : 'h-[320px] px-[60px]', boardShaking && 'animate-[shake_0.4s_ease-in-out]')}
          style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
        >
          {!isVertical && (
            <>
              <div className="absolute h-[1px] z-[1]" style={{ left: '190px', width: '180px', top: '50%', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)' }} />
              <div className="absolute h-[1px] z-[1]" style={{ left: '510px', width: '180px', top: '50%', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)' }} />
            </>
          )}

          {isVertical && (
            <>
              <div className="absolute w-[1px] z-[1]" style={{ top: '120px', height: '40px', left: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)' }} />
              <div className="absolute w-[1px] z-[1]" style={{ top: '220px', height: '40px', left: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)' }} />
            </>
          )}

          <div
            className={cn('relative flex flex-col items-center justify-center rounded-[14px] z-[2] transition-all duration-500', isVertical ? 'w-[140px] h-[80px]' : 'w-[150px] h-[110px]', frontendState === 'success' && 'border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)]', frontendState === 'danger' && 'border-[#f43f5e] shadow-[0_0_20px_rgba(244,63,94,0.15)]', frontendState === 'default' && 'border-[rgba(245,158,11,0.3)]')}
            style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
          >
            <div className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ padding: '1px', background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
            <div className="absolute top-[10px] right-[10px] w-[6px] h-[6px] rounded-full transition-all duration-400" style={{ background: frontendState === 'success' ? '#10b981' : frontendState === 'danger' ? '#f43f5e' : 'rgba(255,255,255,0.2)', boxShadow: frontendState === 'success' ? '0 0 8px #10b981' : frontendState === 'danger' ? '0 0 8px #f43f5e' : 'none' }} />
            <Globe className="h-4 w-4 text-[#f59e0b] mb-1" />
            <h3 className="text-[13px] font-semibold mb-1">Client Application</h3>
            <p className="text-[11px] font-mono" style={{ color: '#9ca3af' }}>{currentStage === 1 ? 'trusted-app.com' : 'malicious-site.xyz'}</p>
          </div>

          <div
            className={cn('relative flex flex-col items-center justify-center rounded-[14px] z-[2] transition-all duration-500', isVertical ? 'w-[140px] h-[80px]' : 'w-[150px] h-[110px]', browserState === 'success' && 'border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)]', browserState === 'danger' && 'border-[#f43f5e] shadow-[0_0_20px_rgba(244,63,94,0.15)]', browserState === 'default' && 'border-[rgba(56,189,248,0.3)]')}
            style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
          >
            <div className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ padding: '1px', background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
            <div className="absolute top-[10px] right-[10px] w-[6px] h-[6px] rounded-full transition-all duration-400" style={{ background: browserState === 'success' ? '#10b981' : browserState === 'danger' ? '#f43f5e' : 'rgba(255,255,255,0.2)', boxShadow: browserState === 'success' ? '0 0 8px #10b981' : browserState === 'danger' ? '0 0 8px #f43f5e' : 'none' }} />
            <Shield className="h-4 w-4 text-[#38bdf8] mb-1" />
            <h3 className="text-[13px] font-semibold mb-1">Web Browser</h3>
            <p className="text-[11px] font-mono" style={{ color: '#9ca3af' }}>Security Agent</p>
          </div>

          <div
            className={cn('relative flex flex-col items-center justify-center rounded-[14px] z-[2] transition-all duration-500', isVertical ? 'w-[140px] h-[80px]' : 'w-[150px] h-[110px]', backendState === 'success' && 'border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)]', backendState === 'danger' && 'border-[#f43f5e] shadow-[0_0_20px_rgba(244,63,94,0.15)]', backendState === 'default' && 'border-[rgba(156,163,175,0.3)]')}
            style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
          >
            <div className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ padding: '1px', background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
            <div className="absolute top-[10px] right-[10px] w-[6px] h-[6px] rounded-full transition-all duration-400" style={{ background: backendState === 'success' ? '#10b981' : backendState === 'danger' ? '#f43f5e' : 'rgba(255,255,255,0.2)', boxShadow: backendState === 'success' ? '0 0 8px #10b981' : backendState === 'danger' ? '0 0 8px #f43f5e' : 'none' }} />
            <Server className="h-4 w-4 text-[#9ca3af] mb-1" />
            <h3 className="text-[13px] font-semibold mb-1">Server Host</h3>
            <p className="text-[11px] font-mono" style={{ color: '#9ca3af' }}>api.server.com</p>
          </div>

          <div
            className="absolute flex flex-col items-center justify-center rounded-[10px] z-[3] pointer-events-none transition-all duration-1000"
            style={{ width: '120px', height: '48px', background: 'rgba(15, 23, 42, 0.9)', border: `1px solid ${packetBorderColor}`, boxShadow: packetShadow, left: packetStyle.left, top: packetStyle.top, opacity: packetState === 'idle' ? 0 : 1 }}
          >
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white">{packetLabel}</span>
            <span className="text-[8px] font-mono mt-0.5 max-w-[100px] truncate" style={{ color: '#9ca3af' }}>{packetSubtext}</span>
          </div>
        </div>

        <div className="rounded-[16px] p-[18px] font-mono text-[12px] leading-relaxed min-h-[110px] relative" style={{ background: 'rgba(10, 15, 26, 0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)', color: '#94a3b8' }}>
          <div className="flex items-center justify-between mb-3 pb-2 text-[10px] uppercase tracking-widest" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#475569' }}>
            <span>Process Console</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            </div>
          </div>
          <div>
            {logs.length === 0 && (
              <div className="flex">
                <span className="text-[#38bdf8] mr-2 select-none">$</span>
                <span>Initializing system sequence...</span>
              </div>
            )}
            {logs.map((log) => (
              <LogLine key={log.id} entry={log} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
