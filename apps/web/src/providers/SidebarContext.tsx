'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';

interface SidebarContextType {
  sidebarRef: React.RefObject<HTMLElement>;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const sidebarRef = useRef<HTMLElement>(null);
  return (
    <SidebarContext.Provider value={{ sidebarRef }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarRef(): React.RefObject<HTMLElement> {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarRef must be used within a SidebarProvider');
  }
  return context.sidebarRef;
}