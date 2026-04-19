# Scope

## V1 — Tool (ship this first)

**In scope:**

- **Editor (Svelte)** accessed at `/editor`:
  - Upload sprite sheets; declare columns/rows/frame-dimensions; view grid overlay with numbered cells.
  - Define animations by selecting frame ranges from the grid; mark animations as `attack`, `projectile`, or `collision`.
  - Configure character stats (speed, health, attacks) with live preview against the running game.
  - Configure stages: layers + parallax rates + enemy waves + ending type (music / boss / cutscene, default music).
  - Upload audio; trim audio non-destructively (already built).
  - Image cropper with Replicate-backed background removal for character photos.
  - Live tuning panel in-game (already built).
- **Runtime engine** reads JSON data files (already refactored).
- **Data persistence**: JSON files under `src/data/games/{slug}/`, written by a Vite dev-server plugin.
- **One published game**: "The Township" — the founder's hometown beat-em-up.

**Out of scope for V1:**

- Accounts, auth, login.
- Database (all data stays as JSON files).
- Stripe, payments, subscription tiers.
- Multi-user access; only the founder uses the editor.
- Custom URLs, subdomains.
- Genres other than beat-em-up.
- In-app artist marketplace.
- AI sprite generator (editor has a stub "Coming soon" button; handled outside the app in V1).
- Google-Maps-to-pixel-art converter.

## V2 — Platform (after V1 proves itself)

**In scope:**

- Supabase: Postgres + auth + blob storage; schema migrated from V1 JSON files 1:1.
- Creator sign-up, email + password or OAuth.
- Per-creator dashboard: their games, their earnings, their tier.
- Stripe subscriptions (three tiers). Founder is merchant of record; no Stripe Connect.
- Pay-to-play flow using Stripe Checkout; revenue splits based on creator's tier.
- Ads (AdSense or equivalent); revenue splits based on creator's tier.
- Published-game routing: `platform.com/play/{slug}` loads the game JSON from Supabase + assets from blob storage.
- Moderation queue — any published game reviewed before going live (legal protection for images of real people, IP concerns, content).

**Out of scope for V2:**

- Custom domains per creator.
- Subdomain routing per creator.
- Multiple game genres.

## V3 — Future

- Second genre: decision-making / fork-in-the-road games.
- AI sprite generator (Replicate-wrapped, metered per creator tier).
- Google-Maps-to-pixel-art converter (Replicate img2img with pixel-art model).
- Custom URLs and subdomains as top-tier subscription features.
- In-app artist marketplace (if demand exists).
- Marketing site that sells the platform itself + done-for-you services.
