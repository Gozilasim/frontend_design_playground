import { LucideIcon } from 'lucide-react';
import { categories } from './categoryDefinitions';

export interface DesignCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  order: number;
  description?: string;
}

export type CategoryId = (typeof categories)[number]['id'];

export { categories };

export function getCategoryById(id: string): DesignCategory | undefined {
  return categories.find((cat) => cat.id === id);
}

export function getCategoriesSorted(): DesignCategory[] {
  return [...categories].sort((a, b) => a.order - b.order);
}
