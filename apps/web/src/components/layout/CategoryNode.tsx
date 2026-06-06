'use client';

import { useState } from 'react';
import { ChevronRight, FolderOpen } from 'lucide-react';
import { DesignCategory } from '@/data';
import { cn } from '@/lib/utils';

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
}

function DesignItem({
  design,
  isSelected,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: DesignItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(design.id)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-1.5',
        'text-muted-foreground text-sm',
        'hover:bg-accent hover:text-foreground',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
        isSelected &&
          'bg-accent font-medium text-foreground before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:bg-primary'
      )}
      style={{ position: 'relative' }}
    >
      <span className="flex-1 truncate">{design.title}</span>
      {design.tags.length > 0 && (
        <span
          className={cn(
            'flex-shrink-0 rounded px-1.5 py-0.5 text-xs',
            'text-muted-foreground bg-muted',
            'opacity-0 transition-opacity group-hover:opacity-100',
            isSelected && 'bg-primary/20 text-primary opacity-100'
          )}
        >
          {design.tags[0]}
        </span>
      )}
    </button>
  );
}
