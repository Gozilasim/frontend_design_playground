'use client';

import { useEffect, useCallback } from 'react';
import { useDesignContext } from '@/providers/DesignProvider';
import { getNextDesignInCategory, getPreviousDesignInCategory } from '@/data/designRegistry';
import { viewportPresets } from '@/data/viewportPresets';

export function useKeyboardShortcuts() {
  const {
    selectedDesignId,
    isFullscreen,
    viewport,
    deviceFrameMode,
    background,
    sidebarOpen,
    zoomLevel,
    dispatch,
  } = useDesignContext();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { key, shiftKey, ctrlKey, metaKey } = event;

      switch (key) {
        case 'f':
        case 'F':
          if (!ctrlKey && !metaKey) {
            event.preventDefault();
            dispatch({ type: 'TOGGLE_FULLSCREEN' });
          }
          break;

        case 'd':
        case 'D':
          if (!ctrlKey && !metaKey) {
            event.preventDefault();
            const currentIndex = viewportPresets.findIndex(
              (v) => v.width === viewport.width && v.height === viewport.height
            );
            const nextIndex = (currentIndex + 1) % viewportPresets.length;
            dispatch({ type: 'SET_VIEWPORT', payload: viewportPresets[nextIndex] });
          }
          break;

        case 'b':
        case 'B':
          if (!ctrlKey && !metaKey) {
            event.preventDefault();
            cycleBackground();
          }
          break;

        case 'ArrowRight':
          if (!ctrlKey && !metaKey && !shiftKey) {
            event.preventDefault();
            const next = getNextDesignInCategory(selectedDesignId || '');
            if (next) dispatch({ type: 'SET_SELECTED_DESIGN', payload: next.id });
          }
          break;

        case 'ArrowLeft':
          if (!ctrlKey && !metaKey && !shiftKey) {
            event.preventDefault();
            const prev = getPreviousDesignInCategory(selectedDesignId || '');
            if (prev) dispatch({ type: 'SET_SELECTED_DESIGN', payload: prev.id });
          }
          break;

        case ' ':
          if (!ctrlKey && !metaKey && !shiftKey) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('toggle-animations'));
          }
          break;

        case 's':
        case 'S':
          if (!ctrlKey && !metaKey) {
            event.preventDefault();
            dispatch({ type: 'TOGGLE_SIDEBAR' });
          }
          break;

        case '?':
          if (shiftKey) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('show-shortcuts'));
          }
          break;

        case '=':
        case '+':
          if (!ctrlKey && !metaKey) {
            event.preventDefault();
            dispatch({ type: 'SET_ZOOM_LEVEL', payload: zoomLevel + 10 });
          }
          break;

        case '-':
        case '_':
          if (!ctrlKey && !metaKey) {
            event.preventDefault();
            dispatch({ type: 'SET_ZOOM_LEVEL', payload: zoomLevel - 10 });
          }
          break;

        case '0':
          if (!ctrlKey && !metaKey) {
            event.preventDefault();
            dispatch({ type: 'RESET_ZOOM' });
          }
          break;

        case 'Escape':
          if (isFullscreen) {
            dispatch({ type: 'SET_FULLSCREEN', payload: false });
          }
          break;

        default:
          break;
      }
    },
    [selectedDesignId, isFullscreen, viewport, zoomLevel, dispatch]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

function cycleBackground() {
  const backgrounds: BackgroundConfig[] = [
    { type: 'solid', value: '#0a0a0a' },
    { type: 'solid', value: '#1a1a2e' },
    { type: 'solid', value: '#16213e' },
    { type: 'solid', value: '#0f0f23' },
    { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { type: 'grid', value: '20' },
  ];

  const currentBg = localStorage.getItem('design-playground-background');
  let currentIndex = 0;
  if (currentBg) {
    try {
      const parsed = JSON.parse(currentBg);
      currentIndex = backgrounds.findIndex(
        (bg) => bg.type === parsed.type && bg.value === parsed.value
      );
      if (currentIndex === -1) currentIndex = 0;
    } catch {
      currentIndex = 0;
    }
  }
  const nextIndex = (currentIndex + 1) % backgrounds.length;
  localStorage.setItem('design-playground-background', JSON.stringify(backgrounds[nextIndex]));
  window.dispatchEvent(new CustomEvent('background-changed', { detail: backgrounds[nextIndex] }));
}

import { BackgroundConfig } from '@/data';
