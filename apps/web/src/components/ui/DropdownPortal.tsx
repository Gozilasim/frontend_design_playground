'use client';

import { forwardRef, type ComponentPropsWithoutRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { cn } from '@/lib/utils';

interface DropdownPortalProps extends ComponentPropsWithoutRef<'div'> {
  buttonRef: RefObject<HTMLElement>;
  isOpen: boolean;
}

export const DropdownPortal = forwardRef<HTMLDivElement, DropdownPortalProps>(
  ({ buttonRef, isOpen, className, style, children, ...props }, ref) => {
    const position = useDropdownPosition(buttonRef, isOpen);

    if (!isOpen || typeof document === 'undefined') {
      return null;
    }

    return createPortal(
      <div
        {...props}
        ref={ref}
        style={{ ...style, top: position.top, right: position.right }}
        className={cn(
          'fixed z-[9999] origin-top-right animate-scale-in rounded-lg border border-border bg-popover shadow-xl',
          className
        )}
      >
        {children}
      </div>,
      document.body
    );
  }
);

DropdownPortal.displayName = 'DropdownPortal';
