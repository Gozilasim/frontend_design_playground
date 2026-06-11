'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, File, Folder, AppWindow } from 'lucide-react';
import { GooeyInput } from '@/components/ui/gooey-input';
import { cn } from '@/lib/utils';

// Category definitions — each maps to an icon and a placeholder string.
const CATEGORIES = [
  { id: 'search', label: 'Search', icon: Search, placeholder: 'Search...' },
  { id: 'file', label: 'File', icon: File, placeholder: 'Search files...' },
  { id: 'folder', label: 'Folder', icon: Folder, placeholder: 'Search folders...' },
  { id: 'app', label: 'App', icon: AppWindow, placeholder: 'Search apps...' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

// Shared spring for the category row entrance.
const rowSpring = { type: 'spring' as const, stiffness: 340, damping: 34, mass: 1 };
// Stagger for individual icon pops.
const iconSpring = { type: 'spring' as const, stiffness: 420, damping: 30 };

export default function GooeyInputDesign() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('search');
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  // Resolve which category drives the placeholder: hovered > active
  const resolvedCategoryId = hoveredCategory ?? activeCategory;
  const resolvedCategory = CATEGORIES.find((c) => c.id === resolvedCategoryId)!;

  const handleCategoryClick = useCallback((id: CategoryId) => {
    setActiveCategory(id);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsInputExpanded(open);
    if (!open) setHoveredCategory(null);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a] p-8">
      {/*
        layoutRoot scopes all layout animations to this subtree,
        preventing interference with other parts of the page.
      */}
      <motion.div layoutRoot className="flex items-center gap-3">

        {/* Category icon circles — slide in from left on expand */}
        {/*
          mode="popLayout": exiting elements are immediately removed from
          layout flow so the remaining elements start their layout animation
          right away — no waiting, no jump.
        */}
        <AnimatePresence mode="popLayout">
          {isInputExpanded && (
            <motion.div
              key="categories"
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={rowSpring}
            >
              {CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const isHovered = hoveredCategory === cat.id;

                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    aria-label={`Search by ${cat.label}`}
                    onClick={() => handleCategoryClick(cat.id)}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    // Each icon pops in with a stagger offset
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ ...iconSpring, delay: i * 0.04 }}
                    // Scale up slightly on hover/active via motion animate
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className={cn(
                      // Same circle style as the gooey bubble
                      'flex size-10 shrink-0 items-center justify-center rounded-full cursor-pointer outline-none',
                      'bg-foreground text-background shadow-sm ring-1 ring-border/60',
                      'transition-opacity duration-150',
                      'focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
                      isActive || isHovered ? 'opacity-100' : 'opacity-45',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                  </motion.button>
                );
              })}

              {/* Thin vertical divider */}
              <motion.div
                className="mx-0.5 h-5 w-px rounded-full bg-white/12"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ ...rowSpring, delay: 0.12 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gooey input — always visible, placeholder swaps with fade */}
        {/*
          layout on this wrapper makes it smoothly animate to its new
          position (center) after the category buttons exit, instead of
          flashing there instantly.
        */}
        <motion.div layout transition={rowSpring}>
          <GooeyInput
            activePlaceholder={resolvedCategory.placeholder}
            collapsedWidth={130}
            expandedWidth={220}
            expandedOffset={-14}
            showBubble={false}
            onOpenChange={handleOpenChange}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
