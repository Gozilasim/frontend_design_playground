'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, X, Menu, Search } from 'lucide-react';
import { getDesignsByCategory } from '@/data/designRegistry';
import { getCategoriesSorted } from '@/data/categories';
import { categories } from '@/data/categoryDefinitions';
import { CategoryNode } from './CategoryNode';
import { useDesignContext, useSidebar } from '@/providers/DesignProvider';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { selectedDesignId, dispatch } = useDesignContext();
  const { open, toggle, set: setSidebarOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    auth: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('design-playground-expanded');
    if (!saved) return;

    try {
      setExpandedCategories(JSON.parse(saved));
    } catch {
      // Ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('design-playground-expanded', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSelectDesign = (designId: string) => {
    dispatch({ type: 'SET_SELECTED_DESIGN', payload: designId });
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return getCategoriesSorted();
    return getCategoriesSorted().filter((cat) =>
      cat.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categoryDesigns = useMemo(() => {
    const map: Record<string, Array<{ id: string; title: string; tags: string[] }>> = {};
    getCategoriesSorted().forEach((cat) => {
      map[cat.id] = getDesignsByCategory(cat.id).map((d) => ({
        id: d.id,
        title: d.title,
        tags: d.tags,
      }));
    });
    return map;
  }, []);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card',
        'flex flex-col transition-all duration-300 ease-in-out',
        open ? 'w-72' : 'w-16'
      )}
      aria-label="Design categories sidebar"
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {open && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Menu className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Design Gallery</span>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'text-muted-foreground rounded-lg p-2 hover:bg-accent hover:text-foreground',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-ring'
          )}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={open}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input placeholder:text-muted-foreground w-full rounded-lg border border-border py-2 pl-10 pr-4
                text-sm focus:outline-none focus:ring-2
                focus:ring-ring"
              aria-label="Search designs"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-3" role="navigation" aria-label="Design categories">
        {open ? (
          <ul className="space-y-2" role="list">
            {filteredCategories.map((category) => {
              const designs = categoryDesigns[category.id] || [];
              const isExpanded = expandedCategories[category.id] ?? false;
              const hasMatch = searchQuery
                ? designs.some(
                    (d) =>
                      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                : true;

              if (searchQuery && !hasMatch) return null;

              return (
                <CategoryNode
                  key={category.id}
                  category={category}
                  isExpanded={searchQuery ? true : isExpanded}
                  onToggle={() => handleToggleCategory(category.id)}
                  selectedDesignId={selectedDesignId}
                  designs={designs}
                  onSelectDesign={handleSelectDesign}
                />
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-1" role="list">
            {categories.map((category) => {
              const designs = categoryDesigns[category.id] || [];
              const isSelected = selectedDesignId && designs.some((d) => d.id === selectedDesignId);
              const Icon = category.icon;

              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedCategories((prev) => ({
                        ...prev,
                        [category.id]: !prev[category.id],
                      }));
                      setSidebarOpen(true);
                    }}
                    className={cn(
                      'mx-auto rounded-lg p-2 transition-colors',
                      'text-muted-foreground hover:bg-accent hover:text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring',
                      isSelected && 'bg-accent text-foreground'
                    )}
                    aria-label={category.label}
                    aria-expanded={expandedCategories[category.id] ?? false}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {open && (
        <div className="border-t border-border p-3">
          <div className="text-muted-foreground text-center text-xs">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">F</kbd> Fullscreen
            &nbsp;
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">D</kbd> Device
            &nbsp;
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">B</kbd> Background
            &nbsp;
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">← →</kbd> Navigate
          </div>
        </div>
      )}
    </aside>
  );
}
