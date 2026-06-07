# Agent Instructions for Frontend Design Playground

## Project Context

This is a monorepo for a UI Design Gallery / Playground application. The primary use case is screen recording coding tutorials and short-form video content (YouTube Shorts, Instagram Reels, Facebook Reels). The application is pure frontend with no backend.

## Technology Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + CSS Variables
- Package Manager: pnpm workspaces
- Icons: Lucide React
- State Management: React Context + useReducer

## Code Standards

### General Rules

- All code comments must be in English
- No Chinese comments anywhere in the codebase
- No emojis in UI components, code, or documentation
- Use functional components with TypeScript interfaces
- Prefer composition over inheritance
- Keep components small and focused (single responsibility)

### TypeScript

- Enable strict mode in tsconfig.json
- Define explicit return types for public functions
- Use interfaces for object shapes, types for unions/primitives
- Avoid `any` - use `unknown` or proper generics
- Export types from barrel files (`index.ts`)

### React Patterns

- Use Server Components by default in App Router
- Mark Client Components with `'use client'` directive only when needed
- Prefer `React.ComponentType<Props>` for component type annotations
- Use `forwardRef` for wrapper components
- Implement error boundaries for design components

### Styling

- Use Tailwind utility classes exclusively
- Define design tokens in CSS variables (globals.css)
- Use `clsx` + `tailwind-merge` for conditional classes
- Avoid arbitrary values - extend theme instead
- Support dark mode via `class` strategy

### File Organization

- Colocate related files (component + types + tests)
- Use barrel exports (`index.ts`) for directories
- Group by feature/category, not by file type
- Maximum 200 lines per component file

### Naming Conventions

- Components: PascalCase (`LoginStreetLight.tsx`)
- Hooks: camelCase with `use` prefix (`useDesignSelector.ts`)
- Utilities: camelCase (`formatViewport.ts`)
- Types/Interfaces: PascalCase (`DesignEntry`, `ViewportPreset`)
- Constants: UPPER_SNAKE_CASE (`VIEWPORT_PRESETS`)
- CSS Variables: kebab-case (`--background`, `--font-inter`)

## Architecture Patterns

### Design Registry

- Single source of truth: `src/data/designRegistry.ts`
- Each design registers with: id, categoryId, title, component, tags, thumbnail
- Categories defined separately in `src/data/categories.ts`
- Viewport presets in `src/data/viewportPresets.ts`

### State Management

- Global state via React Context (`DesignProvider`)
- State slices: selectedDesign, viewport, fullscreen, background, sidebarOpen
- Use `useReducer` for complex state transitions
- Persist user preferences to localStorage

### Design Components

- Each design receives `DesignProps`: viewport, isFullscreen, background
- Designs must be responsive across all 6 viewport presets
- No external API calls or side effects in design components
- Animations respect `prefers-reduced-motion`
- Each design component (e.g. sidebars, forms) must be completely isolated and self-contained. Do not share or reuse sub-components between different design implementations.

## Development Workflow

### Adding a New Design

1. Create component file in appropriate `src/designs/<category>/<subcategory>/`
2. Export from category `index.ts`
3. Add entry to `designRegistry.ts` with metadata
4. Add thumbnail to `public/assets/thumbs/`
5. Test across all viewport presets
6. Verify keyboard navigation works

### Commands

```bash
# Development
pnpm dev                    # Start all apps in dev mode
pnpm --filter @design-playground/web dev  # Start web only

# Building
pnpm build                  # Build all packages
pnpm --filter @design-playground/web build

# Linting & Formatting
pnpm lint                   # Run ESLint
pnpm format                 # Run Prettier
pnpm typecheck              # Run TypeScript compiler check

# Testing
pnpm test                   # Run test suite (when added)
```

## Quality Gates

Before committing, ensure:

- TypeScript compiles without errors (`pnpm typecheck`)
- ESLint passes with no warnings (`pnpm lint`)
- Prettier formatting applied (`pnpm format`)
- All designs render correctly at 6 viewport presets
- Fullscreen mode hides all UI chrome
- Keyboard shortcuts function correctly
- No console errors or warnings

## Deployment

- Static export via `next build` (output: 'export')
- Deploy to Vercel, Cloudflare Pages, or GitHub Pages
- No server-side runtime required
- All assets in `public/` or imported via ES modules

## Future Expansion

The `packages/` directory is reserved for:

- `packages/ui` - Shared component library
- `packages/types` - Shared TypeScript definitions
- `packages/prompts` - AI prompt templates for content generation
- `packages/utils` - Shared utility functions

When adding packages, update `turbo.json` and root `package.json` workspaces.
