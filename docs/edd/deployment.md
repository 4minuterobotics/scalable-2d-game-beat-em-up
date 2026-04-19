# Deployment

## V1

- Static deploy to **Cloudflare Pages** on git push. Dev loop runs locally (`npm run dev`).
- Editor is **not deployed** in V1 — it runs only on the founder's machine (the dev-server middlewares only exist in dev).

## V2

- Same Cloudflare Pages deploy for static runtime + editor.
- **Cloudflare Workers** for:
  - Stripe webhook endpoint
  - Moderation queue actions
  - Server-side AI calls (Replicate) that shouldn't expose an API key to the browser
- **Supabase** hosted; free tier initially, upgrade as creators grow.
