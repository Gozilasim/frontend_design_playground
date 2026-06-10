'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

// Sleep helper function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const colors = {
  new: '#6366f1',
  continue: '#10b981',
  clarify: '#f59e0b',
  chitchat: '#64748b',
  workflow: '#ec4899',
};

const glows = {
  new: 'rgba(99, 102, 241, 0.25)',
  continue: 'rgba(16, 185, 129, 0.25)',
  clarify: 'rgba(245, 158, 11, 0.25)',
  chitchat: 'rgba(100, 116, 139, 0.2)',
  workflow: 'rgba(236, 72, 153, 0.25)',
};

// Path definitions: id → SVG d attribute
const PATH_DEFS: Record<string, string> = {
  'p-user-resolver': 'M 200 262 L 250 262',
  'p-resolver-router': 'M 360 250 C 400 190, 420 80, 470 80',
  'p-resolver-state': 'M 380 262 L 470 205',
  'p-resolver-clarify': 'M 380 262 L 470 320',
  'p-resolver-chat': 'M 360 274 C 400 330, 420 455, 470 455',
  'p-router-exec': 'M 620 80 C 660 80, 660 250, 700 250',
  'p-state-exec': 'M 620 205 L 700 250',
  'p-clarify-user': 'M 470 340 C 370 380, 150 380, 125 310',
  'p-exec-state': 'M 700 270 C 650 280, 630 230, 620 215',
};

export default function WorkflowSchema({ viewport, isFullscreen, background }: DesignProps) {
  const [activeScenario, setActiveScenario] = useState<string>('new');
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [visibleBadges, setVisibleBadges] = useState<string[]>([]);
  const [pbWidths, setPbWidths] = useState<Record<string, number>>({
    new: 0,
    continue: 0,
    clarify: 0,
    chitchat: 0,
    workflow: 0,
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);

  // Timers for the draw→flow transition per path
  const flowTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (!parentRef.current) return;
      const parent = parentRef.current.parentElement;
      if (!parent) return;
      const scaleX = (parent.clientWidth - 32) / 900;
      const scaleY = (parent.clientHeight - 160) / 520;
      setScale(Math.max(0.4, Math.min(scaleX, scaleY, 1)));
    };
    window.addEventListener('resize', handleResize);
    const t = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
    };
  }, [viewport]);

  // -----------------------------------------------------------------
  // Core: animate a single path using getTotalLength()
  // Phase 1 (0–700ms): draw the solid line from start to end
  // Phase 2 (700ms+): switch to flowing dashes
  // -----------------------------------------------------------------
  const animatePath = useCallback(
    (pathId: string, color: string) => {
      const svg = svgRef.current;
      if (!svg) return;
      const el = svg.querySelector<SVGPathElement>(`[data-path-id="${pathId}"]`);
      if (!el) return;

      // Cancel any pending flow-switch timer for this path
      if (flowTimers.current[pathId]) clearTimeout(flowTimers.current[pathId]);

      const len = el.getTotalLength();

      // ── Phase 1: draw ──
      el.style.stroke = color;
      el.style.strokeWidth = '2';
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.style.animation = 'none';
      // Force reflow so the browser registers the starting state
      void el.getBoundingClientRect();

      el.style.transition = `stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)`;
      el.style.strokeDashoffset = '0';

      // ── Phase 2: flowing dashes ──
      flowTimers.current[pathId] = setTimeout(() => {
        el.style.transition = 'none';
        el.style.strokeDasharray = '8 4';
        el.style.strokeDashoffset = '0';
        el.style.animation = 'wf-flow 15s linear infinite';
      }, 720);
    },
    []
  );

  // Reset all active paths to dormant (invisible)
  const resetAllPaths = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    Object.values(flowTimers.current).forEach(clearTimeout);
    flowTimers.current = {};

    Object.keys(PATH_DEFS).forEach((pathId) => {
      const el = svg.querySelector<SVGPathElement>(`[data-path-id="${pathId}"]`);
      if (!el) return;
      el.style.stroke = 'transparent';
      el.style.strokeDasharray = '';
      el.style.strokeDashoffset = '';
      el.style.transition = 'none';
      el.style.animation = 'none';
    });
  }, []);

  // -----------------------------------------------------------------
  // Main scenario loop
  // -----------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    const runLoop = async () => {
      const keys = ['new', 'continue', 'clarify', 'chitchat', 'workflow'] as const;
      let index = 0;

      while (!isCancelled) {
        const key = keys[index];
        const color = colors[key];

        // ── Reset ──
        setActiveScenario(key);
        setActiveNodes([]);
        setVisibleBadges([]);
        setPbWidths((p) => ({ ...p, new: 0, continue: 0, clarify: 0, chitchat: 0, workflow: 0 }));
        resetAllPaths();

        await sleep(80);
        if (isCancelled) break;
        setPbWidths((p) => ({ ...p, [key]: 100 }));

        // ── Run scenario ──
        if (key === 'new') {
          setActiveNodes(['n-user']);
          await sleep(600);
          if (isCancelled) break;
          animatePath('p-user-resolver', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-resolver']);
          await sleep(500);
          if (isCancelled) break;
          animatePath('p-resolver-router', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-router']);
          setVisibleBadges(['rb-sop']);
          await sleep(700);
          if (isCancelled) break;
          animatePath('p-router-exec', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-exec']);
          setVisibleBadges((p) => [...p, 'rb-skill']);
        } else if (key === 'continue') {
          setActiveNodes(['n-user']);
          await sleep(600);
          if (isCancelled) break;
          animatePath('p-user-resolver', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-resolver']);
          await sleep(500);
          if (isCancelled) break;
          animatePath('p-resolver-state', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-state']);
          await sleep(700);
          if (isCancelled) break;
          animatePath('p-state-exec', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-exec']);
          setVisibleBadges(['rb-skill']);
        } else if (key === 'clarify') {
          setActiveNodes(['n-user']);
          await sleep(600);
          if (isCancelled) break;
          animatePath('p-user-resolver', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-resolver']);
          await sleep(500);
          if (isCancelled) break;
          animatePath('p-resolver-clarify', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-clarify']);
          await sleep(700);
          if (isCancelled) break;
          animatePath('p-clarify-user', color);
          await sleep(900);
          if (isCancelled) break;
          // re-bounce user node
          setActiveNodes((p) => p.filter((id) => id !== 'n-user'));
          await sleep(40);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-user']);
        } else if (key === 'chitchat') {
          setActiveNodes(['n-user']);
          await sleep(600);
          if (isCancelled) break;
          animatePath('p-user-resolver', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-resolver']);
          await sleep(500);
          if (isCancelled) break;
          animatePath('p-resolver-chat', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-chitchat']);
        } else if (key === 'workflow') {
          setActiveNodes(['n-user']);
          await sleep(600);
          if (isCancelled) break;
          animatePath('p-user-resolver', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-resolver']);
          await sleep(500);
          if (isCancelled) break;
          animatePath('p-resolver-router', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-router']);
          setVisibleBadges(['rb-sop']);
          await sleep(700);
          if (isCancelled) break;
          animatePath('p-router-exec', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-exec']);
          setVisibleBadges((p) => [...p, 'rb-skill']);
          await sleep(900);
          if (isCancelled) break;
          animatePath('p-exec-state', color);
          await sleep(700);
          if (isCancelled) break;
          setActiveNodes((p) => [...p, 'n-state']);
        }

        await sleep(3500);
        if (isCancelled) break;
        index = (index + 1) % keys.length;
      }
    };

    runLoop();
    return () => {
      isCancelled = true;
    };
  }, [animatePath, resetAllPaths, viewport]);

  const color = colors[activeScenario as keyof typeof colors];
  const glow = glows[activeScenario as keyof typeof glows];

  return (
    <div
      ref={parentRef}
      className="relative flex h-full w-full select-none flex-col items-center justify-center overflow-hidden p-4 transition-all duration-300"
      style={getBackgroundStyle(background)}
    >
      {/* Global keyframe for flowing dashes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wf-flow {
          to { stroke-dashoffset: -200; }
        }
        @keyframes nodeBounce {
          0%   { transform: translateY(0)     scale(1); }
          30%  { transform: translateY(-10px) scale(1.05); }
          50%  { transform: translateY(1.5px) scale(0.97); }
          70%  { transform: translateY(-1px)  scale(1.01); }
          100% { transform: translateY(0)     scale(1.03);
                 box-shadow: 0 0 20px var(--glow-color); }
        }
        .wf-node.active {
          border-color: var(--node-color) !important;
          background: #111728;
          animation: nodeBounce 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}} />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-80 w-80 animate-pulse rounded-full bg-indigo-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-pink-600/10 blur-[120px] delay-1000" />

      <h1 className="mb-5 flex-shrink-0 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
        Workflow Engineering Schema
      </h1>

      {/* Tabs */}
      <div className="z-10 mb-8 flex w-full max-w-[950px] flex-shrink-0 flex-wrap justify-center gap-3">
        {(['new', 'continue', 'clarify', 'chitchat', 'workflow'] as const).map((key) => {
          const labels = {
            new: 'NEW TASK',
            continue: 'CONTINUE WORKFLOW',
            clarify: 'CLARIFY WORKFLOW',
            chitchat: 'CHITCHAT BYPASS',
            workflow: 'WORKFLOW ENGINEERING',
          };
          const isActive = activeScenario === key;
          const tc = colors[key];
          return (
            <div
              key={key}
              className={cn(
                'relative overflow-hidden rounded-md border border-[#1e293b] bg-[#0f1422] p-2 px-4 text-[11px] font-semibold tracking-wider transition-all duration-300',
                isActive ? 'text-slate-100' : 'text-slate-500'
              )}
              style={isActive ? { borderColor: tc, boxShadow: `0 0 15px ${glows[key]}` } : {}}
            >
              {labels[key]}
              <div
                className="absolute bottom-0 left-0 h-[2px]"
                style={{
                  backgroundColor: tc,
                  width: `${pbWidths[key]}%`,
                  transition: pbWidths[key] > 0 ? 'width 6500ms linear' : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Canvas */}
      <div
        className="relative h-[520px] w-[900px] flex-shrink-0 overflow-hidden rounded-xl border border-[#1e293b] bg-[#090d1a]"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
          ['--node-color' as any]: color,
          ['--glow-color' as any]: glow,
        }}
      >
        {/* SVG layer */}
        <svg ref={svgRef} className="absolute left-0 top-0 h-full w-full" style={{ zIndex: 1 }}>
          {/* Dormant background paths (always visible, dim) */}
          {Object.entries(PATH_DEFS).map(([id, d]) => (
            <path key={`bg-${id}`} d={d} fill="none" stroke="#1e293b" strokeWidth="1.5" />
          ))}

          {/* Active overlay paths — controlled entirely via DOM in animatePath() */}
          {Object.entries(PATH_DEFS).map(([id, d]) => (
            <path
              key={`active-${id}`}
              data-path-id={id}
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>

        {/* Nodes */}
        {[
          { id: 'n-user',     label: 'USER QUERY',   sub: 'Client Interface',  left: 50,  top: 230 },
          { id: 'n-resolver', label: 'RESOLVER',      sub: 'Meta Classifier',   left: 250, top: 230 },
          { id: 'n-router',   label: 'ROUTER',        sub: 'SOP Dispatcher',    left: 470, top: 40  },
          { id: 'n-state',    label: 'SESSION STATE', sub: 'State Locker',      left: 470, top: 165 },
          { id: 'n-clarify',  label: 'CLARIFY NODE',  sub: 'Conflict Handler',  left: 470, top: 290 },
          { id: 'n-chitchat', label: 'SMALL LLM',     sub: 'Chitchat Node',     left: 470, top: 415 },
          { id: 'n-exec',     label: 'EXECUTION',     sub: 'Runtime Handler',   left: 700, top: 230 },
        ].map(({ id, label, sub, left, top }) => (
          <div
            key={id}
            className={cn(
              'wf-node absolute z-10 w-[150px] rounded-lg border border-[#1e293b] bg-[#0f1422] px-[18px] py-[14px] transition-colors duration-300',
              activeNodes.includes(id) && 'active'
            )}
            style={{ left, top }}
          >
            <div className="mb-1 text-[12px] font-semibold tracking-tight text-slate-100">{label}</div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500">{sub}</div>
          </div>
        ))}

        {/* Runtime Badges */}
        <div
          className="pointer-events-none absolute z-20 rounded border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 font-mono text-[10px] text-emerald-400 transition-all duration-300"
          style={{
            left: 470, top: 108,
            opacity: visibleBadges.includes('rb-sop') ? 1 : 0,
            transform: visibleBadges.includes('rb-sop') ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          SOP: flight_refund
        </div>
        <div
          className="pointer-events-none absolute z-20 rounded border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 font-mono text-[10px] text-emerald-400 transition-all duration-300"
          style={{
            left: 700, top: 310,
            opacity: visibleBadges.includes('rb-skill') ? 1 : 0,
            transform: visibleBadges.includes('rb-skill') ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          skill.md (Hydrated)
        </div>
      </div>

      {!isFullscreen && (
        <div className="z-10 mt-6 flex-shrink-0 text-center text-xs text-slate-500">
          Press <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">F</kbd> for fullscreen •{' '}
          <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">D</kbd> for device size
        </div>
      )}
    </div>
  );
}

function getBackgroundStyle(background: { type: string; value: string }): React.CSSProperties {
  switch (background.type) {
    case 'solid':
      return { backgroundColor: background.value };
    case 'gradient':
      return { backgroundImage: background.value };
    case 'grid': {
      const size = parseInt(background.value, 10) || 24;
      return {
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundColor: '#030712',
      };
    }
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
