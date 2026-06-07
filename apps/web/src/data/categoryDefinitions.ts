import {
  Lock,
  LayoutDashboard,
  Globe,
  MessageSquare,
  Box,
  User,
  CreditCard,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { DesignCategory } from './categories';

export const categories: DesignCategory[] = [
  {
    id: 'login',
    label: 'Login',
    icon: Lock,
    order: 1,
    description: 'Various login page designs and styles',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    order: 2,
    description: 'Admin panels, analytics, SaaS dashboards',
  },
  {
    id: 'landing',
    label: 'Landing Pages',
    icon: Globe,
    order: 3,
    description: 'Hero sections, features, pricing, testimonials',
  },
  {
    id: 'chatbot',
    label: 'Chatbot UI',
    icon: MessageSquare,
    order: 4,
    description: 'Support widgets, AI agents, messaging interfaces',
  },
  {
    id: 'components',
    label: 'UI Components',
    icon: Box,
    order: 5,
    description: 'Buttons, forms, cards, tables, modals showcase',
  },
];

export const categoryIcons = {
  login: Lock,
  dashboard: LayoutDashboard,
  landing: Globe,
  chatbot: MessageSquare,
  components: Box,
} as const;
