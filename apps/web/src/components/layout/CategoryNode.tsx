'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { DesignCategory } from '@/data';
import { cn } from '@/lib/utils';
import { useSidebarRef } from '@/providers/SidebarContext';

interface CategoryNodeProps {
  category: DesignCategory;
  isExpanded: boolean;
  onToggle: () => void;
  selectedDesignId: string | null;
  designs: Array<{ id: string; title: string; tags: string[] }>;
  onSelectDesign: (designId: string) => void;
}

export function CategoryNode({
  category,
  isExpanded,
  onToggle,
  selectedDesignId,
  designs,
  onSelectDesign,
}: CategoryNodeProps) {
  const [hoveredDesign, setHoveredDesign] = useState<string | null>(null);
  const sidebarRef = useSidebarRef();

  const Icon = category.icon;

  return (
    <div className="group">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2',
          'text-muted-foreground text-sm font-medium hover:text-foreground',
          'transition-colors hover:bg-accent',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
        )}
        aria-expanded={isExpanded}
        aria-controls={`category-${category.id}`}
      >
        <Icon
          className={cn(
            'h-4 w-4 flex-shrink-0',
            'transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
        <span className="flex-1 truncate">{category.label}</span>
        <ChevronRight
          className={cn(
            'text-muted-foreground h-4 w-4 flex-shrink-0',
            'transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      <div
        id={`category-${category.id}`}
        role="region"
        aria-label={`${category.label} designs`}
        className={cn(
          'overflow-hidden transition-all duration-200 ease-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ul className="ml-6 mt-1 space-y-1" role="list">
          {designs.map((design) => (
            <li key={design.id}>
              <DesignItem
                design={design}
                isSelected={selectedDesignId === design.id}
                isHovered={hoveredDesign === design.id}
                onSelect={onSelectDesign}
                onMouseEnter={() => setHoveredDesign(design.id)}
                onMouseLeave={() => setHoveredDesign(null)}
                sidebarRef={sidebarRef}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface DesignItemProps {
  design: { id: string; title: string; tags: string[] };
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (designId: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  sidebarRef: React.RefObject<HTMLElement>;
}

function DesignItem({
  design,
  isSelected,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  sidebarRef,
}: DesignItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);
  const [indicatorRect, setIndicatorRect] = useState<DOMRect | null>(null);
  const resizeObserverRef = useRef<ResizeObserver>();

  const updatePosition = useCallback(() => {
    const item = itemRef.current;
    const sidebar = sidebarRef.current;
    if (!item || !sidebar || !isSelected) return;

    const itemRect = item.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();

    // Account for sidebar padding (nav has p-3 = 12px)
    const navPadding = 12;
    const contentLeft = sidebarRect.left + navPadding;
    const contentWidth = sidebarRect.width - navPadding * 2;

    const itemLeft = itemRect.left - contentLeft;
    const itemWidth = itemRect.width;

    let left = Math.max(0, Math.min(itemLeft, contentWidth - itemWidth));
    if (itemLeft < 0) {
      left = 0;
    } else if (itemLeft + itemWidth > contentWidth) {
      left = contentWidth - itemWidth;
    }

    setIndicatorRect({
      ...itemRect,
      left: contentLeft + left,
      top: itemRect.top,
      width: itemWidth,
      height: itemRect.height,
    } as DOMRect);
  }, [isSelected, sidebarRef]);

  useEffect(() => {
    if (!isSelected) {
      setIndicatorRect(null);
      return;
    }

    updatePosition();

    // Observe item size changes
    if (itemRef.current) {
      resizeObserverRef.current = new ResizeObserver(updatePosition);
      resizeObserverRef.current.observe(itemRef.current);
    }

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    // Also listen for sidebar width changes
    const sidebar = sidebarRef.current;
    if (sidebar) {
      const sidebarObserver = new ResizeObserver(updatePosition);
      sidebarObserver.observe(sidebar);
      return () => {
        sidebarObserver.disconnect();
      };
    }
  }, [isSelected, updatePosition, sidebarRef]);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  return (
    <>
      {isSelected && indicatorRect && (
        <div
          className="bg-primary/20 border-primary/40 shadow-primary/20 pointer-events-none fixed z-[60] animate-scale-in rounded-md border shadow-xl transition-all duration-150 ease-out"
          style={{
            left: indicatorRect.left,
            top: indicatorRect.top,
            width: indicatorRect.width,
            height: indicatorRect.height,
          }}
          aria-hidden="true"
        />
      )}
      <button
        ref={itemRef}
        type="button"
        onClick={() => onSelect(design.id)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          'relative flex w-full items-center gap-2 rounded-md px-3 py-1.5',
          'text-muted-foreground text-sm',
          'hover:bg-accent hover:text-foreground',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
          isSelected && 'relative z-10 bg-accent font-medium text-foreground',
          isHovered && !isSelected && 'bg-accent/50'
        )}
      >
        <span className="flex-1 truncate">{design.title}</span>
        {design.tags.length > 0 && (
          <span
            className={cn(
              'flex-shrink-0 rounded px-1.5 py-0.5 text-xs',
              'text-muted-foreground bg-muted',
              'opacity-0 transition-opacity',
              (isHovered || isSelected) && 'opacity-100',
              isSelected && 'bg-primary/20 text-primary'
            )}
          >
            {design.tags[0]}
          </span>
        )}
      </button>
    </>
  );
}
