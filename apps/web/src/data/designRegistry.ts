import { ReactNode } from 'react';
import { ViewportPreset } from './viewportPresets';
import { viewportPresets } from './viewportPresets';
import LoginStreetLight from '@/designs/auth/login/LoginStreetLight';
import LoginNeon from '@/designs/auth/login/LoginNeon';
import LoginGlassmorphism from '@/designs/auth/login/LoginGlassmorphism';
import LoginMinimal from '@/designs/auth/login/LoginMinimal';

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'grid';
  value: string;
}

export interface DesignProps {
  viewport: ViewportPreset;
  isFullscreen: boolean;
  background: BackgroundConfig;
}

export interface DesignEntry {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  component: React.ComponentType<DesignProps>;
  tags: string[];
  thumbnail?: string;
  recommendedViewport?: ViewportPreset;
}

export const designRegistry: DesignEntry[] = [
  {
    id: 'login-street-light',
    categoryId: 'auth',
    title: 'Street Light',
    description: 'Dark theme with neon glow accents and animated light rays',
    component: LoginStreetLight,
    tags: ['dark', 'neon', 'animated', 'cyberpunk'],
    recommendedViewport: viewportPresets[1],
  },
  {
    id: 'login-neon',
    categoryId: 'auth',
    title: 'Neon Cyberpunk',
    description: 'Futuristic cyan/pink glow with scanline effects',
    component: LoginNeon,
    tags: ['dark', 'neon', 'cyberpunk', 'glitch'],
    recommendedViewport: viewportPresets[1],
  },
  {
    id: 'login-glassmorphism',
    categoryId: 'auth',
    title: 'Glassmorphism',
    description: 'Frosted glass morphism with subtle gradients',
    component: LoginGlassmorphism,
    tags: ['light', 'glass', 'frosted', 'modern'],
    recommendedViewport: viewportPresets[1],
  },
  {
    id: 'login-minimal',
    categoryId: 'auth',
    title: 'Minimal Clean',
    description: 'Typography-focused clean design with generous whitespace',
    component: LoginMinimal,
    tags: ['light', 'minimal', 'clean', 'typography'],
    recommendedViewport: viewportPresets[1],
  },
];

export function getDesignById(id: string): DesignEntry | undefined {
  return designRegistry.find((design) => design.id === id);
}

export function getDesignsByCategory(categoryId: string): DesignEntry[] {
  return designRegistry.filter((design) => design.categoryId === categoryId);
}

export function getNextDesign(currentId: string): DesignEntry | undefined {
  const currentIndex = designRegistry.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return designRegistry[0];
  const nextIndex = (currentIndex + 1) % designRegistry.length;
  return designRegistry[nextIndex];
}

export function getPreviousDesign(currentId: string): DesignEntry | undefined {
  const currentIndex = designRegistry.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return designRegistry[designRegistry.length - 1];
  const prevIndex = (currentIndex - 1 + designRegistry.length) % designRegistry.length;
  return designRegistry[prevIndex];
}

export function getNextDesignInCategory(currentId: string): DesignEntry | undefined {
  const current = getDesignById(currentId);
  if (!current) return undefined;
  const categoryDesigns = getDesignsByCategory(current.categoryId);
  const currentIndex = categoryDesigns.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return categoryDesigns[0];
  const nextIndex = (currentIndex + 1) % categoryDesigns.length;
  return categoryDesigns[nextIndex];
}

export function getPreviousDesignInCategory(currentId: string): DesignEntry | undefined {
  const current = getDesignById(currentId);
  if (!current) return undefined;
  const categoryDesigns = getDesignsByCategory(current.categoryId);
  const currentIndex = categoryDesigns.findIndex((d) => d.id === currentId);
  if (currentIndex === -1) return categoryDesigns[categoryDesigns.length - 1];
  const prevIndex = (currentIndex - 1 + categoryDesigns.length) % categoryDesigns.length;
  return categoryDesigns[prevIndex];
}
