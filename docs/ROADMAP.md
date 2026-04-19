# Roadmap — Township Game Builder

Step-by-step path from today's state to the fully realized platform. This is the *ordered build plan*; the [PRD](PRD.md) and [EDD](EDD.md) cover the *what* and *why*, and [PROJECT_STATUS.md](PROJECT_STATUS.md) tracks what's checked off.

**Rule of thumb:** finish a phase before starting the next. Don't pull V2 work into V1 to "save time" — the V1 → V2 gate exists because JSON-file editing has to prove itself before adding auth/DB complexity.

---

## Current state

- V1 runtime engine: complete.
- V1 editor: character editor, stage editor, sprite sheet editor, image cropper, audio trimmer — all complete.
- JSON data persistence via dev-server endpoints: complete.
- One complete game (Township): complete.

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the checkbox view.

---

## Phase 1 — Finish V1 (you are here)

Goal: founder can build the full Township game using only the editor, with no source-file edits, for 2 weeks straight. That's the gate to V2 ([phasing.md](edd/phasing.md)).

### 1.1 Editor quick-wins (DONE)

1. ✅ **"Save animation to character" shortcut inside SpriteSheetEditor** — writes directly via `/_dev/save-character`, merges into existing slot, shows current image + frame-count warning.

### 1.2 Role flexibility + character swap

1. **Role-agnostic characters.** Drop the `kind === 'enemy'` filter so any character can be used as the player OR as an enemy wave. `kind` becomes a suggestion, not a gate.
2. **Player character switcher.** Dropdown in GameOverview (and optionally the in-game Tuning Panel) that writes `game.playerCharacter` via `/_dev/save-game`.
3. **Enemy character picker per wave.** StageEditor's wave character dropdown lists every character, not just those with `kind: "enemy"`.

### 1.3 Input bindings + action expansion

1. **Game-level input-bindings editor.** Add/remove action names in `game.json` `inputBindings`, assign one or more keys to each. Saves via `/_dev/save-game`.
2. **Character input-action mapping UI** already exists in CharacterEditor — extend it to include all currently-defined game actions so new actions can be wired to animation slots per character (e.g., `shootHigh` → `shoot-high-anim`).
3. Authors can now create slots like `punchHigh`, `kickLow`, `crawl`, `takeDamage`, etc., and bind them to keys.

### 1.4 Sprite sheet: projectile + explosion ranges

1. Extend SpriteSheetEditor to capture up to three sub-ranges per save: **main** (character anim), **projectile** (flying bullet frames — often on the same row), **explosion** (impact frames).
2. Stored under the animation as `projectile: { row, startColumn, frames, sheet }` and `explosion: { row, startColumn, frames, sheet }`.
3. Still works if a sub-range is omitted (non-projectile anims stay simple).

### 1.5 Difficulty system

1. Add `game.difficulty` (integer, dev-editable). Default 1.
2. Extend stage wave config with either `countByDifficulty: { "1": 3, "2": 5, "3": 8 }` or `baseCount + countPerDifficulty` curve — pick the simpler one during implementation.
3. Tuning Panel gets a difficulty slider + saves via `/_dev/save-game`.
4. Optional: add `countJitter` per wave so enemy count in a wave is `final = base + round(Math.random() * jitter)`.

### 1.6 Take-damage animation runtime

1. New optional animation slot (convention: `takeDamage`).
2. Runtime: `Character.takeDamage` checks for the slot and plays it if present; if absent, the character's current animation continues (graceful degradation).
3. Does not interrupt `isActing` attacks — player/enemy stays committed to an attack if mid-swing.

### 1.7 Projectile runtime

1. New `Projectile` entity class: position, velocity, sprite frames (from sub-ranges in 1.4), owner, damage, lifetime.
2. New animation event `projectileSpawn` — fires when the animator reaches a configurable `spawnFrame`, similar to how `attackHit` works today.
3. `World.update` ticks projectiles, checks collisions against enemies (or player, if an enemy fired), triggers the explosion animation on hit, removes the projectile.
4. World renders projectiles in the same z-sorted pass as characters.

### 1.8 Stage items + solid-object collision (new)

Purpose: let creators drop discrete objects (tables, barrels, fences, trees) onto a stage and mark them as solid so characters can't walk through them.

1. **Stage-item sprite-sheet tooling.** Extend SpriteSheetEditor so a user can upload a sheet containing multiple discrete items (different x/y/w/h per item, not a grid animation) and crop each into its own PNG in `img/stage-items/` via a new endpoint `/_dev/crop-from-sheet` (re-uses the image cropper internals, not Replicate).
2. **Item library.** A persistent `src/data/games/{slug}/items.json` listing each cropped item with a display name and default `collisionBox: { x, y, width, height }` (defaults to full sprite).
3. **StageEditor: "Items" section.** Per-stage list of placed items — each with `itemId`, `x`, `y`, optional `parallax` (if placed in a parallax layer), and `solid: true|false`.
4. **Runtime: solid-object collision.** `World.update` resolves character movement against each stage's solid items. Simplest implementation: AABB sweep on `vx`/`vy`, push character out of the rectangle along the shorter axis. Applies to player and all AI.
5. **StageEditor preview:** render the stage background + items in a canvas preview inside the editor so you can drag items to position them (stretch; inputs first, drag later).

### 1.9 Guided mode (walkthrough editor) (new)

Purpose: accessible onboarding for users who don't know the quick-edit panels. The current editor stays as "Quick edit mode" for advanced users.

1. **Mode toggle on the editor landing page.** "Quick edit" (current) or "Guided mode" (walkthrough).
2. **Guided mode: root prompt.** "Create character / Edit character / Create stage / Edit stage / Edit sounds".
3. **Edit character → action-type router.**
   - Pick character → pick action/animation slot (run, jump, shoot, high kick, …).
   - The editor screen that appears is tailored to the action type:
     - **Locomotion (run/walk/crawl):** footstep frame picker (click-to-mark), step sound, animation rate. No "hit frame" or "damage."
     - **Attack (punch/kick/bite):** hit frame (click a frame in the canvas), hit-sprite selector, x/y of contact box (click to place hitbox over the character), damage, start sound, hit sound.
     - **Projectile (throw/shoot):** projectile sprite range selector (click on the sheet), spawn frame, projectile speed/direction, explosion sprite range, damage.
     - **Reaction (take damage/death):** frames, rate, no hitbox, optional sound.
   - One-screen-per-action: no fields outside the current action type should clutter the screen.
4. **Edit stage → content router.** "Background / Foreground layers" vs "Stage items" — each route goes to a tailored editor.
5. **Under the hood:** guided mode calls the same endpoints as quick edit. It's a different Svelte route tree that produces the same JSON.

### 1.10 Remaining P1 editor features

1. **Stage length + ending UI polish.** Inline preview of total stage width in tiles + warn if it exceeds the cap.
2. **Live preview sync.** When a save endpoint fires, broadcast over a dev WebSocket. The game tab listens and does a soft reload of the affected game's JSON without a full page refresh.
3. **Asset manager route.** `/editor#/assets` lists every file in `img/` and `sounds/`, shows which characters/stages reference each, flags unused assets, lets the user delete them (with a confirmation).
4. **"New Game" scaffolder.** Button on the games list. Prompts for slug + display name, creates `src/data/games/{slug}/` with minimum viable `game.json`, one empty stage, one empty character, placeholder images.
5. **Sprite sheet click-for-hitFrame.** Let the user set the `hitFrame` by clicking a frame in the grid rather than typing a number.

### 1.3 Stage length cap

1. Add a per-game config: `maxStageTileWidth`. Default to `player.width × 200` (open question — see [open-questions.md](prd/open-questions.md) once decided).
2. StageEditor warns when exceeded; runtime engine logs a console warning but still renders.
3. Document the cap in a tooltip next to the `lengthTiles` field.

### 1.4 Eat your own dog food

1. Rebuild all 4 Township stages from scratch using only the editor. No direct JSON edits.
2. Add a 5th stage end-to-end using only the editor, including a new character built from a photograph via the Replicate cropper.
3. If anything requires source-file edits to work, it's a V1 bug — fix before moving on.

### 1.5 V1 stability pass

1. Hook up basic error boundaries in the Svelte editor so one broken character doesn't blank the whole UI.
2. Add a "Backup game" button that zips `src/data/games/{slug}/` + referenced assets and downloads it. Critical before V2 migration.
3. Run through the full editor flow on a fresh clone to catch missing-file / first-run issues.

### 1.6 V1 → V2 transition gate

- Two weeks of editor-only use complete.
- All 5 Township stages built via editor.
- No unfixed P1 editor bugs.
- Full backup of current JSON data exists.

---

## Phase 2 — V2 foundations: data layer + auth

Goal: same editor, same runtime, but data lives in Supabase instead of JSON files, and multiple creators can sign up.

### 2.1 Schema migration

1. In `docs/edd/data-storage.md`, lock the V2 Postgres schema (tables: `creators`, `games`, `characters`, `stages`, `animations`, `attacks`, `assets`, `sound_trims`). Match field names to current JSON 1:1 so the editor UI doesn't need rewriting.
2. Set up a Supabase project. Enable Auth (email/password + Google OAuth). Enable Storage with two buckets: `images` and `sounds`.
3. Write a one-time migration script (`scripts/migrate-json-to-supabase.js`) that reads `src/data/games/*` and uploads into the schema. Run it against a scratch project first.
4. Keep the JSON files as the source of truth until the migration passes a round-trip test: export Supabase → JSON → diff against originals → zero drift.

### 2.2 Swap the data layer

1. Introduce a data adapter interface: `loadGame`, `saveCharacter`, `saveStage`, `uploadAsset`. V1 implementation hits the dev endpoints + JSON; V2 implementation hits Supabase.
2. Flip the adapter via env var (`DATA_SOURCE=json|supabase`).
3. Run the editor + runtime against Supabase for at least a week on the founder's own games before exposing to anyone else.

### 2.3 Auth + creator accounts

1. Add sign-up / login pages. Email verification required before publishing.
2. `creators` row created on sign-up. Each creator's `games` rows are scoped by `creator_id`.
3. Editor now shows only the logged-in creator's games.
4. Founder account flagged `is_admin = true` — used later for the moderation queue.

### 2.4 Published-game routing

1. Route: `platform.com/play/{creator-slug}/{game-slug}`.
2. Server fetches the game's JSON (or equivalent DB rows) + asset URLs from Supabase Storage and serves the runtime.
3. Public by default once `games.status = 'published'`; private otherwise.

### 2.5 Deploy

1. Frontend: Cloudflare Pages (or Vercel).
2. Dev endpoints are gone in production — all writes go through Supabase with RLS policies enforcing `creator_id = auth.uid()`.
3. Asset uploads go directly to Supabase Storage via signed URLs.

---

## Phase 3 — V2 monetization: Stripe, tiers, moderation

### 3.1 Stripe subscription tiers

1. Three price IDs in Stripe matching the tiers in [pricing-tiers.md](prd/pricing-tiers.md).
2. Checkout flow: Stripe Checkout (hosted). Webhook updates `creators.tier` on success/cancel.
3. Billing portal link in the creator dashboard.
4. Founder is the merchant of record — no Stripe Connect in V2.

### 3.2 Per-tier gating

1. Asset storage cap per tier. Enforced at upload time.
2. Number of published games per tier.
3. Revenue-split config stored per tier (used in 3.3 and 3.4).

### 3.3 Pay-to-play checkout flow

1. Creator can mark a game as paid with a price.
2. Stripe Checkout on the play page; webhook flips a `purchases` row so the player can access the game.
3. Revenue split applied based on the creator's tier.

### 3.4 Ads wiring

1. AdSense (or equivalent) slots on free-to-play games.
2. Creator can opt out if they pay a higher tier.
3. Revenue split applied based on tier.

### 3.5 Moderation queue

1. New game publish → `status = 'pending'`. Shows up in the founder's admin queue.
2. Admin UI: approve / reject with a reason. Rejection email via EmailJS (or Resend).
3. Republish after edits re-queues for moderation.
4. Hard rules: no likenesses of real minors without signed consent on file; no copyrighted sprites; no content that violates Stripe's prohibited business list.

### 3.6 Creator dashboard

1. Their games, their tier, their storage usage, their revenue.
2. Per-game: plays, purchases, ad revenue, moderation status.
3. Billing portal link.

### 3.7 V2 launch

1. Invite 5–10 hand-picked creators as a closed beta. Free or discounted tier.
2. Collect feedback for 4–6 weeks. Fix what breaks.
3. Open sign-ups.

### 3.8 V2 → V3 transition gate

- 10+ paying creators.
- Moderation workflow is stable (no incidents).
- Revenue share is stable (no disputes).

---

## Phase 4 — V3 expansion

### 4.1 Second genre: fork-in-the-road / decision game

1. Abstract the runtime: the beat-em-up engine becomes one of several "game kinds." Data model grows a `games.kind` enum.
2. Decision-game runtime: scenes, choices, branching state, text + image + optional audio per node.
3. New editor surface for the decision-game kind. Shares sprite sheet / image cropper / audio trimmer tooling with the beat-em-up editor.
4. Ship with one published decision game as the reference.

### 4.2 AI sprite generator

1. Replicate wrapper (model selection TBD — likely SDXL + pixel-art LoRA).
2. Metered per creator tier. Track generations in `usage` table.
3. Generated sprite sheets land in the same flow as uploaded ones.

### 4.3 Google Maps → pixel-art stages

1. User enters an address or drops a pin. Static Maps API → image.
2. Replicate img2img with a pixel-art model converts to a stage-ready tile.
3. Auto-slice into parallax layers if possible; otherwise present as a single background.

### 4.4 Custom URLs + subdomains

1. Top-tier subscription feature.
2. `{slug}.platform.com` via wildcard DNS on Cloudflare.
3. Custom domain via CNAME for the highest tier.

### 4.5 In-app artist marketplace (conditional on demand)

1. Artists list sprite-sheet packs with prices.
2. Creators buy packs, packs drop into their asset library.
3. Revenue split with the artist.

### 4.6 Done-for-you services site

1. Separate marketing site that sells: (a) the tool, (b) done-for-you game creation by the founder using the tool.
2. Case studies built from early creators.
3. Lead-gen form → Calendly + Stripe deposit.

---

## Phase 5 — Steady-state platform

At this point the product is a multi-genre, multi-tenant game-creation SaaS with tiered subscriptions, a moderation pipeline, optional AI content tools, and a services arm. Ongoing work is the normal SaaS loop: churn analysis, content-policy updates, genre experiments, creator retention.

**Signals it's time to invest more heavily:**
- Repeated feature requests from paying creators that cluster around one theme.
- Organic signups outpacing the founder's available support time.
- A single creator's game consistently generating more than the subscription covers — signal to revisit revenue splits.

---

## How to use this file

- Work top-to-bottom. Each phase has a transition gate that must be met before starting the next.
- When a step is done, check it off in [PROJECT_STATUS.md](PROJECT_STATUS.md) and append a line to [CHANGELOG.md](CHANGELOG.md).
- If a step reveals a scope change, update the relevant PRD/EDD section *and* this roadmap in the same commit so they don't drift.
- Don't add steps here speculatively. If a feature isn't committed to, it belongs in [open-questions.md](prd/open-questions.md).
