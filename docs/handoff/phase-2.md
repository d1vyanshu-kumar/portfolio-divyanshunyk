# Phase 2 Handoff: Static Content & Cloudflare Deployment Ready

## What was built
- **Hero Section with Photo Cutout**:
  - Transparent cutout (`/photo/nayak-cutout.webp`, 25 KB & PNG fallback) anchored bottom-left, bleeding off the left and bottom edges. Well below the 80 KB budget.
  - Headline, sub-line, and status chip matching `docs/source/site-config.md`.
  - Responsive alignment and fluid typography.
- **Four Deep-Dive Architectural Case Studies (`/work/[slug]`)**:
  1. **Debezium Host-Based Pipeline Deployment (GSoC 2026)**:
     - Scoped across 7 sub-issues; logged run completed in 10m 43s with ~500MB image pre-pull.
     - Animated 4-step provisioning pipeline flow: `~/.ssh/config` edit -> Java NIO WatchService -> Ansible execution -> Host marked `READY`.
     - Custom SVG architecture diagram covering Conductor, sorted `PESSIMISTIC_WRITE` locks, isolated thread pool, and non-blocking Quarkus Host Agent daemon (202 Accepted).
     - Decisions & trade-offs evaluated: Quarkus `@LookupIfProperty` vs runtime factory, zero-dependency OpenSSH parser vs JSch, sorted locking vs optimistic retries.
  2. **Mobile-Responsive Layout for MIT App Inventor (GSoC 2025)**:
     - 6,492 lines across 59 files, accepted for platform winter release.
     - Figma prototype interaction model, bottom tab bar, and Blockly touch gesture coordinate mapping.
  3. **Event-Driven E-commerce Microservices (Nov 2024)**:
     - 6 decoupled services, Kafka + Avro Schema Registry, Spring Cloud Gateway OAuth2 resource server with Keycloak 24, Resilience4j circuit breakers.
  4. **Open Source Engineering Impact Across 13 Organizations**:
     - 47 PRs, 26 merged, 20 repos, 13 orgs.
     - Debezium core bugfixes (PR #7132, PR #7168), CNCF Headlamp (PR #4463), nostream (PR #470), Avni.
  - **Retrospective Banner**: Every case study features a distinct, clearly marked `"What I would do differently"` section containing a TODO for Divyanshu to fill in.
- **Velocity Metrics & `/stack` Page**:
  - Days to first merge metric cards: Debezium (14 days), MIT App Inventor (18 days), Headlamp (12 days), nostream (6 days), Avni (21 days).
  - Categorized production skill matrix (Languages, Backend & Systems, Data & Streaming, Infra & Observability).
  - Open source scorecard and community contribution pills.
- **Contact & 404 Pages**:
  - `/contact`: Direct inbox mailto link, interactive copy-to-clipboard button with status pill, social links, and die-cut sticker (`/photo/nayak-sticker.webp`, 38 KB).
  - `/404`: "Target machine unreachable", floating die-cut sticker, and cluster navigation buttons.
- **GitHub Data Script**:
  - `scripts/fetch-github-data.mjs`: Reads `GITHUB_TOKEN` from environment; exits cleanly with code 0 without failing if token is missing.
  - Verified seed data committed in `apps/web/src/data/github.json` derived strictly from `facts.md`.
- **Cloudflare Deployment & Security**:
  - `wrangler.jsonc` at root configured to deploy `apps/web/dist` as Cloudflare Workers Static Assets with 404 fallback.
  - `apps/web/public/_headers` with strict CSP (no third-party scripts), HSTS (`max-age=31536000`), `frame-ancestors 'none'`, and immutable caching for fonts, photos, and assets.
  - `robots.txt` and `sitemap.xml` listing all 9 routes.
  - JSON-LD `Person` structured data on homepage.

## Verification results
- `pnpm --filter @portfolio/web typecheck`: 0 errors, 0 warnings, 0 hints across 17 files.
- `pnpm build:web`: 9 static routes built in 1.51s.
- `node scripts/verify-contrast.mjs`: All contrast pairings pass WCAG AA (>5.0:1) across all 3 themes.
- Client JS bundle: 59 KB gzip (well within the 90 KB budget).
- Hero image: 25 KB WebP (well within the 80 KB budget).
- Git tag: `phase-2-done` on branch `build/frontend`.

## How to run locally
```bash
pnpm dev:web      # http://localhost:4321
pnpm build:web    # Builds production static bundle into apps/web/dist/
node scripts/verify-contrast.mjs # Verifies WCAG AA contrast
```

---

## Exactly what you must do by hand to deploy to Cloudflare

Follow these exact steps when you are ready to publish the portfolio live on Cloudflare:

### 1. Merge and Push to GitHub
```bash
# Verify your commits on the build/frontend branch
git log --oneline -n 5

# Merge to main (or push branch to your GitHub remote)
git checkout main
git merge build/frontend
git push origin main --tags
```

### 2. Log in to Cloudflare CLI
```bash
# Log in to your Cloudflare account in the terminal
npx wrangler login
```

### 3. Deploy Static Assets via Cloudflare Workers
From the repository root:
```bash
# 1. Build the production static bundle
pnpm build:web

# 2. Deploy directly to Cloudflare
npx wrangler deploy
```

`wrangler.jsonc` at the root will automatically upload `apps/web/dist` and serve all static assets, handle custom `_headers` (CSP, HSTS), and serve `404.html` on unknown routes.

### 4. (Optional) Custom Domain Setup
In your Cloudflare Dashboard:
1. Navigate to **Workers & Pages** -> Select `portfolio-divyanshunyk`.
2. Go to **Settings** -> **Domains & Routes** -> **Add Custom Domain**.
3. Enter your domain (e.g. `divyanshunyk.dev`). Cloudflare will automatically provision SSL certificates.

### 5. (Optional) Automatic Git Deployments via Cloudflare Dashboard
If you prefer automatic deployments on every `git push`:
1. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your repository `portfolio-divyanshuNYK`.
3. Set the build settings:
   - **Framework preset**: None
   - **Build command**: `pnpm build:web`
   - **Build output directory**: `apps/web/dist`
   - **Root directory**: `/`
4. Save and deploy.
