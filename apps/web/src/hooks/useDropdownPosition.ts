'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

const DROPDOWN_GAP = 6;

export interface DropdownPosition {
  top: number;
  right: number;
}

export function useDropdownPosition<T extends HTMLElement>(
  buttonRef: RefObject<T>,
  isOpen: boolean
): DropdownPosition {
  const [position, setPosition] = useState<DropdownPosition>({ top: 0, right: 0 });

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || typeof window === 'undefined') return;

    const rect = buttonRef.current.getBoundingClientRect();
    const nextPosition = {
      top: rect.bottom + DROPDOWN_GAP,
      right: window.innerWidth - rect.right,
    };

    setPosition((currentPosition) =>
      currentPosition.top === nextPosition.top && currentPosition.right === nextPosition.right
        ? currentPosition
        : nextPosition
    );
  }, [buttonRef]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    let animationFrameId = 0;

    const updateEveryFrame = () => {
      updatePosition();
      animationFrameId = window.requestAnimationFrame(updateEveryFrame);
    };

    updatePosition();
    animationFrameId = window.requestAnimationFrame(updateEveryFrame);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { capture: true, passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, { capture: true });
    };
  }, [isOpen, updatePosition]);

  return position;
}
