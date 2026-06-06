'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { ViewportPreset, BackgroundConfig } from '@/data';

interface DesignState {
  selectedDesignId: string | null;
  viewport: ViewportPreset;
  isFullscreen: boolean;
  background: BackgroundConfig;
  sidebarOpen: boolean;
  deviceFrameMode: 'none' | 'browser' | 'mobile' | 'shorts';
  zoomLevel: number;
}

type DesignAction =
  | { type: 'SET_SELECTED_DESIGN'; payload: string }
  | { type: 'SET_VIEWPORT'; payload: ViewportPreset }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_BACKGROUND'; payload: BackgroundConfig }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_DEVICE_FRAME_MODE'; payload: DesignState['deviceFrameMode'] }
  | { type: 'SET_ZOOM_LEVEL'; payload: number }
  | { type: 'RESET_ZOOM' }
  | { type: 'HYDRATE'; payload: Partial<DesignState> };

const initialState: DesignState = {
  selectedDesignId: null,
  viewport: { width: 1440, height: 900, label: 'Desktop 1440×900', deviceType: 'desktop' },
  isFullscreen: false,
  background: { type: 'solid', value: '#0a0a0a' },
  sidebarOpen: true,
  deviceFrameMode: 'none',
  zoomLevel: 100,
};

function designReducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case 'SET_SELECTED_DESIGN':
      return { ...state, selectedDesignId: action.payload };
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.payload };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    case 'SET_BACKGROUND':
      return { ...state, background: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_DEVICE_FRAME_MODE':
      return { ...state, deviceFrameMode: action.payload };
    case 'SET_ZOOM_LEVEL':
      return { ...state, zoomLevel: Math.max(25, Math.min(200, action.payload)) };
    case 'RESET_ZOOM':
      return { ...state, zoomLevel: 100 };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface DesignContextType extends DesignState {
  dispatch: Dispatch<DesignAction>;
}

const DesignContext = createContext<DesignContextType | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(designReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('design-playground-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'HYDRATE', payload: parsed });
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('design-playground-state', JSON.stringify(state));
  }, [state]);

  return <DesignContext.Provider value={{ ...state, dispatch }}>{children}</DesignContext.Provider>;
}

export function useDesignContext(): DesignContextType {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesignContext must be used within a DesignProvider');
  }
  return context;
}

export function useSelectedDesignId(): string | null {
  return useDesignContext().selectedDesignId;
}

export function useSetSelectedDesign(): Dispatch<DesignAction> {
  const { dispatch } = useDesignContext();
  return dispatch;
}

export function useViewport(): ViewportPreset {
  return useDesignContext().viewport;
}

export function useSetViewport(): Dispatch<DesignAction> {
  const { dispatch } = useDesignContext();
  return dispatch;
}

export function useFullscreen(): {
  isFullscreen: boolean;
  toggle: () => void;
  set: (value: boolean) => void;
} {
  const { isFullscreen, dispatch } = useDesignContext();
  return {
    isFullscreen,
    toggle: () => dispatch({ type: 'TOGGLE_FULLSCREEN' }),
    set: (value: boolean) => dispatch({ type: 'SET_FULLSCREEN', payload: value }),
  };
}

export function useBackground(): {
  background: BackgroundConfig;
  set: (bg: BackgroundConfig) => void;
} {
  const { background, dispatch } = useDesignContext();
  return {
    background,
    set: (bg: BackgroundConfig) => dispatch({ type: 'SET_BACKGROUND', payload: bg }),
  };
}

export function useSidebar(): { open: boolean; toggle: () => void; set: (value: boolean) => void } {
  const { sidebarOpen, dispatch } = useDesignContext();
  return {
    open: sidebarOpen,
    toggle: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    set: (value: boolean) => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: value }),
  };
}

export function useDeviceFrameMode(): {
  mode: DesignState['deviceFrameMode'];
  set: (mode: DesignState['deviceFrameMode']) => void;
} {
  const { deviceFrameMode, dispatch } = useDesignContext();
  return {
    mode: deviceFrameMode,
    set: (m) => dispatch({ type: 'SET_DEVICE_FRAME_MODE', payload: m }),
  };
}

export function useZoom(): { level: number; set: (level: number) => void; reset: () => void } {
  const { zoomLevel, dispatch } = useDesignContext();
  return {
    level: zoomLevel,
    set: (level: number) => dispatch({ type: 'SET_ZOOM_LEVEL', payload: level }),
    reset: () => dispatch({ type: 'RESET_ZOOM' }),
  };
}
