# Technology Stack

| Layer | V1 | V2 | Rationale |
|---|---|---|---|
| Runtime engine | Vanilla JS + Vite + Howler | Same | Works, is lean, ships ~38 KB gzipped. |
| Editor UI | Svelte + `@sveltejs/vite-plugin-svelte` | Same | Less ceremony than React; closer to vanilla than SvelteKit. Single SPA under `/editor`. |
| Data (dev) | JSON files, Vite dev middleware writes | — | No backend needed; founder-only. |
| Data (prod) | — | Supabase (Postgres + auth + storage + RLS) | One vendor covers auth, DB, blob storage, edge functions. |
| Payments | — | Stripe Checkout + Customer Portal | Founder is merchant of record; no Stripe Connect. |
| Hosting | Cloudflare Pages (static) | Cloudflare Pages + Workers (API routes for Stripe webhook, moderation queue) | Cheap, fast CDN, path-routed. |
| AI services | Replicate (`rembg` for bg removal, `pixel-art` img2img later) | Same | Pay-per-inference, no infra. |
| Canvas upgrade (optional) | — | Phaser | Deferred; current vanilla canvas handles beat-em-up fine. |
