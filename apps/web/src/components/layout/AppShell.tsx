'use client';

import { ReactNode } from 'react';
import { DesignProvider } from '@/providers/DesignProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { PreviewShell } from '@/components/layout/PreviewShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <DesignProvider>
      <KeyboardShortcutsProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <PreviewShell />
        </div>
        {children}
      </KeyboardShortcutsProvider>
    </DesignProvider>
  );
}
