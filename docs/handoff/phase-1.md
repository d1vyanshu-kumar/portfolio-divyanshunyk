# Phase 1 Handoff: Design System and Shell

## What was built
- **Self-Hosted Typography**:
  - Geist Sans (Variable WOFF2, 29 KB)
  - Geist Mono (Variable WOFF2, 23 KB)
  - Instrument Serif (Regular and Italic WOFF2, 30 KB)
  - Preloaded critical fonts with `@font-face` definitions in `apps/web/src/styles/fonts.css`. No external Google Fonts connections or trackers.
- **Glass Nav Dock**:
  - CSS `backdrop-filter: blur(20px) saturate(1.4)` glassmorphism with hairline border and inner highlight
  - Touch targets meeting or exceeding 44px
  - 3-state Theme Toggle button cycling: `after-hours` (dark) -> `daylight` (light) -> `dawn` (warm)
  - Zero-flash inline script in `<head>` honoring system preference on first visit and persisting choices in `localStorage`
  - Integrated `⌘K` command palette launcher button
- **Accessible Command Palette (`Cmd+K`)**:
  - Global `Cmd+K` / `Ctrl+K` keyboard shortcut listener and escape-to-close
  - Filterable commands across Navigation (Home, Selected Work, Stack, Contact), Theme Switching, and Quick Actions (Copy Email, GitHub, LinkedIn)
  - Keyboard navigation via Arrow keys, Enter to execute, Escape to dismiss, with focus restoration
- **Next Chapter Footer**:
  - Dynamic forward chapter mapping based on current URL path
  - ListenBrainz music playing indicator pill with animated equalizer bars
  - Paper Shaders and Astro attribution
- **Page Transitions**:
  - Astro `ClientRouter` enabled in `BaseLayout.astro`
  - Navigation dock persistent across page changes with `transition:persist="nav-header"`
  - Full support for `prefers-reduced-motion`
- **Automated Contrast Verification**:
  - `scripts/verify-contrast.mjs` validates WCAG AA contrast for all theme token pairings (>5.0:1 across all three themes).

## Decisions made
- **Local WOFF2 assets over npm package imports**: Directly serving preloaded WOFF2 files from `apps/web/public/fonts/` ensures zero runtime build-time transformation overhead, deterministic caching, and compliance with the strict CSP (no external font origins).
- **Zero-Dependency Command Palette**: Implemented pure vanilla TypeScript/Astro command palette without adding heavyweight modal or fuzzy search libraries, keeping the client bundle lean (under 65 KB gzip total).

## Verification results
- `node scripts/verify-contrast.mjs`: All checks PASS (WCAG AA compliant in all 3 themes)
- `pnpm --filter @portfolio/web typecheck`: 0 errors, 0 warnings, 0 hints
- `pnpm build:web`: 5 static pages built in ~1.7s, client JS 59 KB gzip (budget: <90 KB gzip)
- Git tag: `phase-1-done`

## How to run
```bash
pnpm dev:web      # Open http://localhost:4321
pnpm build:web    # Builds production static bundle into apps/web/dist/
node scripts/verify-contrast.mjs # Verifies WCAG AA color contrast
```

## What you must do by hand
1. Open http://localhost:4321 in your browser and test:
   - Press `Cmd+K` to open the Command Palette.
   - Click the theme toggle icon in the nav dock to cycle through After Hours, Daylight, and Dawn.
   - Navigate between pages to observe smooth view transitions.
2. When ready, type `continue` to start Phase 2 (Static content, hero with photo cutout, case studies, /work/[slug], /stack with GitHub data, Cloudflare deployment config).
