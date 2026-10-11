# Phase 0 Handoff: Foundation

## What was built
- pnpm monorepo with `apps/web` and `packages/tokens`
- Astro 5.18.2 (static output), React 19.1.0, Tailwind CSS v4.3.3 via @tailwindcss/vite
- Design tokens package with 3 themes (after-hours, daylight, dawn), fluid type scale, spacing, radii, motion durations, reduced-motion support
- Glass nav dock with 3-theme toggle, no-flash inline script
- Hero section with headline, status chip, proof strip, animated gradient
- 5 pages: home, /work, /stack, /contact, 404
- Seed GitHub data JSON from facts.md
- Build output: 59 KB gzip client JS (under 90 KB budget)
- README with run instructions

## Decisions made
- **Astro 5.18.2 over Astro 7.4.2**: Astro 7 requires Node >= 22.23.4, we have 22.14.0. Astro 5 supports >= 22.0.0. Upgrade Node later to move to Astro 7.
- **@tailwindcss/vite over @astrojs/tailwind**: The official Astro Tailwind integration only supports Tailwind v3. Tailwind v4 uses the Vite plugin directly.
- **No Quarkus scaffold yet**: Java backend deferred to Phase 3.
- **No CI yet**: GitHub Actions deferred until repo is pushed to GitHub.

## Not yet done
- [ ] Self-hosted fonts (Geist, Geist Mono, Instrument Serif) - Phase 1
- [ ] Command palette (Cmd+K) - Phase 1
- [ ] Page transitions with Astro ClientRouter - Phase 1
- [ ] Case study detail pages (/work/[slug]) - Phase 2
- [ ] GitHub Actions CI - after push
- [ ] Quarkus API scaffold - Phase 3
- [ ] ADR template and first ADRs - next commit

## How to run
```bash
pnpm install
pnpm dev:web      # http://localhost:4321
pnpm build:web    # static output in apps/web/dist/
```

## What you must do by hand
1. Open http://localhost:4321 in your browser and verify
2. Create GitHub repo and push when ready
3. Drop photo files into docs/source/photo/ before Phase 2
