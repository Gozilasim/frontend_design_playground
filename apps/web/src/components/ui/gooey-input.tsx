'use client';

import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type ChangeEvent,
} from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

// Negative value = gap between bubble and pill; positive = overlap (gooey merge).
const DEFAULT_EXPANDED_OFFSET_PX = -8;

function GooeyFilter({ filterId, blur }: { filterId: string; blur: number }) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

// Silky spring — used for every spatial animation.
const springTransition = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 36,
  mass: 1,
};

// Softer spring for enter/exit scale pops.
const popTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 28,
};

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  /** Override placeholder at runtime (e.g. on category hover). Falls back to `placeholder`. */
  activePlaceholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  collapsedWidth?: number;
  expandedWidth?: number;
  /**
   * Offset in px between bubble and pill when expanded.
   * Negative = visible gap (separated look).
   * Positive = overlap (gooey-merged look).
   * Default: -8 (gap).
   */
  expandedOffset?: number;
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Whether to show the separate bubble circle when expanded. Default: true. */
  showBubble?: boolean;
}

export function GooeyInput({
  placeholder = 'Type to search...',
  activePlaceholder,
  className,
  classNames,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = DEFAULT_EXPANDED_OFFSET_PX,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onOpenChange,
  disabled = false,
  showBubble = true,
}: GooeyInputProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, '');
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;

  const setSearchText = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = useCallback(
    (next: boolean) => {
      setIsExpanded(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText('');
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setSearchText]);

  // Spring-driven width — silky smooth, no abrupt jumps.
  const widthSpring = useSpring(collapsedWidth, { stiffness: 380, damping: 36, mass: 1 });
  // Spring-driven marginLeft — animates together with width.
  const marginSpring = useSpring(0, { stiffness: 380, damping: 36, mass: 1 });

  useEffect(() => {
    widthSpring.set(isExpanded ? expandedWidth : collapsedWidth);
    marginSpring.set(isExpanded ? expandedOffset : 0);
  }, [isExpanded, expandedWidth, collapsedWidth, expandedOffset, widthSpring, marginSpring]);

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    [setSearchText],
  );

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  const surfaceClass = 'bg-foreground text-background shadow-sm ring-1 ring-border/60';

  const resolvedPlaceholder = activePlaceholder ?? placeholder;

  const inputClassName = cn(
    'h-full min-w-0 flex-1 appearance-none bg-transparent py-0 text-sm leading-none text-background outline-none',
    '[&::-webkit-search-cancel-button]:hidden',
    '[&::-webkit-input-placeholder]:opacity-0 placeholder:opacity-0',
    !isExpanded && 'pointer-events-none',
    classNames?.input,
  );

  return (
    <div
      className={cn('relative flex items-center justify-center', className, classNames?.root)}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className={cn('relative flex h-10 items-center', classNames?.filterWrap)}
        style={{ filter: `url(#${filterId})` }}
      >
        <AnimatePresence>
          {isExpanded && showBubble && (
            <motion.div
              key="bubble"
              className={cn(
                'relative flex h-10 w-10 shrink-0 items-center justify-center',
                classNames?.bubble,
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={popTransition}
            >
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-full',
                  surfaceClass,
                  classNames?.bubbleSurface,
                )}
              >
                <SearchIcon layoutId={iconLayoutId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Width + marginLeft both driven by springs for silky motion */}
        <motion.div
          className={cn('flex h-10 items-center', classNames?.buttonRow)}
          style={{ width: widthSpring, marginLeft: marginSpring }}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            className={cn(
              'relative flex h-10 w-full cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
              surfaceClass,
              classNames?.trigger,
            )}
          >
            {!isExpanded ? <SearchIcon layoutId={iconLayoutId} /> : null}

            {/* Animated placeholder overlay — fades & slides on text change */}
            <AnimatePresence mode="wait">
              {!searchText && (
                <motion.span
                  key={resolvedPlaceholder}
                  className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-center px-4 text-sm leading-none select-none"
                  style={{ paddingLeft: isExpanded ? '1rem' : '2.25rem' }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <span
                    className={cn(
                      'truncate text-background/60',
                      !isExpanded && 'text-background/80',
                    )}
                  >
                    {resolvedPlaceholder}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>

            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchText}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled || !isExpanded}
              className={inputClassName}
            />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
