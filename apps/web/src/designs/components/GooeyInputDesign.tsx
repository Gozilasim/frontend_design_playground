'use client';

import React from 'react';
import { GooeyInput } from '@/components/ui/gooey-input';

export default function GooeyInputDesign() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
      <GooeyInput placeholder="Search..." />
    </div>
  );
}
