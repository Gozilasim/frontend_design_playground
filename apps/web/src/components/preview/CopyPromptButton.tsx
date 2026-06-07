'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { useDesignContext } from '@/providers/DesignProvider';
import { getDesignById } from '@/data/designRegistry';
import { cn } from '@/lib/utils';

type CopyState = 'idle' | 'copied' | 'no-prompt';

export function CopyPromptButton() {
  const { selectedDesignId } = useDesignContext();
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const selectedDesign = selectedDesignId ? getDesignById(selectedDesignId) : null;
  const hasPrompt = Boolean(selectedDesign?.prompt);

  const handleCopy = useCallback(async () => {
    if (!selectedDesign?.prompt) {
      setCopyState('no-prompt');
      setTimeout(() => setCopyState('idle'), 1500);
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedDesign.prompt);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = selectedDesign.prompt;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    }
  }, [selectedDesign]);

  if (!selectedDesignId) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={copyState === 'copied'}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring',
        copyState === 'copied' && 'bg-green-500/15 text-green-400',
        copyState === 'no-prompt' && 'bg-amber-500/15 text-amber-400',
        copyState === 'idle' && hasPrompt && 'text-muted-foreground hover:bg-accent hover:text-foreground',
        copyState === 'idle' && !hasPrompt && 'cursor-not-allowed text-muted-foreground/40',
      )}
      aria-label="Copy design prompt"
      title={!hasPrompt ? 'No prompt available for this design' : 'Copy prompt to clipboard'}
    >
      {copyState === 'copied' ? (
        <>
          <Check className="h-4 w-4" />
          <span>Copied!</span>
        </>
      ) : copyState === 'no-prompt' ? (
        <>
          <FileText className="h-4 w-4" />
          <span>No prompt</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>Copy Prompt</span>
        </>
      )}
    </button>
  );
}
