# API Contracts

## V1 — Vite dev-server middlewares

All endpoints validate `gameSlug` against `/^[a-z0-9][a-z0-9-]*$/`, filenames against a similar safe regex, and write only within the project root. Plugins use `apply: 'serve'` so they don't exist in production builds.

| Endpoint | Method | Body | Effect | Status |
|---|---|---|---|---|
| `/_dev/sound-trims` | POST | `{ gameSlug, soundName, trim \| null }` | Upserts / removes trim on `sounds.json`. | Implemented |
| `/_dev/save-character` | POST | `{ gameSlug, characterName, config }` | Writes `characters/{name}.json`. | To add |
| `/_dev/save-stage` | POST | `{ gameSlug, stageName, config }` | Writes `stages/{name}.json`. | To add |
| `/_dev/save-game` | POST | `{ gameSlug, game }` | Writes `game.json`. | To add |
| `/_dev/upload-asset` | POST | multipart: `{ gameSlug, kind, file }` | Writes to `img/` or `sounds/`; returns path. | To add |
| `/_dev/crop-and-rembg` | POST | `{ gameSlug, imageUrl, crop }` | Replicate rembg call; saves result. | To add |

## V2 — Supabase client + Cloudflare Workers

- **Editor CRUD**: Supabase JS client, RLS per creator.
- **Published-game read**: public Supabase view `published_game` (filtered to `published_at IS NOT NULL`).
- **Stripe webhook**: Cloudflare Worker endpoint → validates signature → writes `subscription` row + `payout_ledger` entry.
- **Replicate proxy**: Cloudflare Worker holds the Replicate API key; editor calls the Worker, not Replicate directly.
