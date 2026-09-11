<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Canvas — Wallpaper Hub

ChatGPT-style, **database-less** wallpaper download site. Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4. Providers: **Pexels** (default) + **Pixabay**. UI is a **light/white theme** (no dark mode).

## Commands
- `npm run dev` — dev server
- `npm run build` — production build (run before finishing a task)
- `npm run lint` — ESLint
- Use Node 22: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use default`

## Environment (never commit; see `.env.local.example`)
- `PEXELS_API_KEY` — https://www.pexels.com/api/ (200 req/hr, 20k/mo)
- `PIXABAY_API_KEY` — https://pixabay.com/api/docs/ (100 req / 60s)
- `UNSPLASH_API_KEY` — **DISABLED**: Unsplash ToS does not permit wallpaper apps. Adapter is kept (commented integration) in `lib/providers/unsplash.ts`; see its header note to re-enable.

## Architecture
- Keys are **server-only**. All provider calls happen in Route Handlers under `app/api/`; never `NEXT_PUBLIC_`.
- `lib/providers/` — `types.ts` (unified `ImageHit`), one adapter per provider, `index.ts` orchestrates `searchImages()` with a Pexels → Pixabay fallback cascade (Unsplash wiring commented out).
- **Caching is the database**: every upstream `fetch` uses `next: { revalidate: 86400 }` (all providers mandate 24h caching). No DB, no storage.
- Downloads: `app/api/download/route.ts` proxies CDN bytes (host allowlist) so the browser gets a true `Content-Disposition` attachment download. `app/api/basket-download/route.ts` streams a server-side ZIP (archiver) of multiple images.
- Basket + search history: `localStorage` only (keys `canvas:basket`, `canvas:history`). Basket items carry an `addedAt` timestamp and auto-prune after 24h.
- Attribution required by all providers — always rendered in the Lightbox. The lightbox/fullscreen photo viewer keeps a dark backdrop by design.

## Next.js 16 gotchas
- Read the guides under `node_modules/next/dist/docs/` before writing Next-specific code (breaking changes vs. older Next).
- Route Handlers are **not cached by default**; rely on fetch-level `revalidate`, not route-level config.
- Generated route types (`LayoutProps<"/">`, `PageProps`, `RouteContext`) are global — use them.
- Do NOT enable Cache Components (`cacheComponents`) — previous-model fetch caching is sufficient and simpler here.

## Conventions
- Kebab-case files, TS strict, import alias `@/*` (maps to repo root).
- Any component using hooks/events must start with `"use client";`.
- Keep provider adapters pure (plain async functions, no hooks); UI lives in `components/` + `hooks/`.
- NEVER commit unless explicitly asked.
