# Project Status

Living snapshot. Updated every work session.

**Phase:** V1 — Tool

**Last updated:** 2026-04-19

## Done

- Vanilla-JS runtime engine working end-to-end: input, camera, parallax layers, enemies, attacks, hit effects, z-sorting, 4-direction movement.
- Modular codebase split under `src/engine/`, `src/game/`, `src/characters/`, `src/controllers/`.
- Data-driven games: JSON in `src/data/games/{slug}/`, loaded via `loadGame.js`.
- One complete game (**Township**) with 4 stages, 2 characters.
- In-game tuning panel for live parameter editing (press `T`).
- Non-destructive audio trimming (waveform editor + Howler-sprite playback + persisted metadata).
- Dev-server endpoint for writing trim metadata (`/_dev/sound-trims`).
- PRD + EDD written, split into section files, linked from `CLAUDE.md`.
- **Svelte editor scaffold** at `/editor.html`:
  - Hash-based routing.
  - Games list (enumerates `src/data/games/*`).
  - Game overview page (shows characters, stages, assets, settings).
  - Placeholder screens for stage, sprite-sheets, sounds routes.
- **Character editor** (full):
  - Stats: kind, speed, health, draw dims, frame dims, frame offsets, sprite center offset, start direction/animation.
  - Animations (collapsible per-anim): frames, rate, loop, next, frame offset, footsteps, projectile/collision flags, image paths.
  - Attack sub-editor per animation: width, height, damage, hitFrame, start/voice/hit sounds, hit-sprite image paths. Add/remove attack.
  - Input actions (dropdown per action → animation).
  - Sound slots (dropdown per slot → sound name).
  - AI (for enemies): detectRange, stop.x/y, speechChance, speechLines.
- **Stage editor** (full):
  - Top-level: name, lengthTiles, tileWidth.
  - Ending block: type, tileCount, durationMs, music.
  - Layers + items: add/remove, all geometry fields editable.
  - Enemy waves: add/remove, character dropdown, count/x/y/speed/health.
- **Sprite sheet editor** — upload, grid overlay with numbered cells, frame-range click-select, animation-spec JSON with copy-to-clipboard, **"Save to character" dropdown** that merges the spec directly into a chosen character's `animations[slot]` (existing or new).
- **Image cropper with Replicate bg-removal** — upload photo, draggable crop box with corner handles, POST to Replicate `rembg`, transparent PNG saved to `img/`. Requires `REPLICATE_API_TOKEN` env var.
- **Dev write endpoints**: `/_dev/save-character`, `/_dev/save-stage`, `/_dev/save-game`, `/_dev/upload-asset`, `/_dev/crop-and-rembg`, `/_dev/sound-trims` — all validated, dev-only.
- **Tuning panel "Save all to disk"** — one button writes all current tuned values back to the relevant JSON files.
- **Stage picker in Tuning Panel** — dropdown to jump between stages during play.
- **Input-bindings editor** — `/editor.html#/{slug}/inputs` manages `game.inputBindings`: rename actions, add/remove actions, capture a keystroke to bind, remove individual keys, saves via `/_dev/save-game`. CharacterEditor's Input Actions section now auto-lists every game action and binds it to an animation slot (or "none").
- **Role-agnostic characters + player character switcher:**
  - Runtime no longer filters enemies by `character.kind` — any character can be the player OR an enemy wave.
  - GameOverview dropdown swaps `game.playerCharacter` via `/_dev/save-game`.
  - Tuning Panel (T) also has a "Player character" dropdown for live in-game swap (reloads the stage).
  - StageEditor's wave-character dropdown lists every character, not just those with `kind: "enemy"`.
- **Runtime fixes (2026-04-18 p.m.):**
  - Per-enemy stop-position jitter (`ai.stopJitter.{x,y}`) so AIs don't stack onto one pixel.
  - Hit-sprite composites as an overlay on top of the base sprite instead of replacing it (fixes character briefly disappearing on contact).
  - One-shot guard on `onStageComplete` / `onPlayerDead` to stop the same transition from firing every frame until the new scene loads.

## In progress

- Nothing active.

## Next up (V1 P1)

- Stage length + ending UI polish (already editable via StageEditor; may want inline preview).
- Live preview sync: editor writes → game tab auto-reloads.
- Asset manager: list all images/sounds, show usage, delete unused.
- Game creation flow — "New Game" button that scaffolds an empty `src/data/games/{slug}/` with minimum viable files.

## V2 blockers

- Supabase schema migration from JSON.
- Auth + creator sign-up.
- Stripe subscription integration.
- Moderation queue.
- Deploy to Cloudflare Pages.

## Next up (V1 P1, after P0)

- Stage length + ending settings in editor UI.
- Live preview sync: editor writes → game tab auto-reloads.
- Asset manager: list all images/sounds, show usage, delete unused.

## Parked / deferred

- 8 legacy image files in `img/` not referenced by any JSON — **keep** as test data for the sprite-sheet upload UI.
- AI sprite generator (V3).
- Google Maps → pixel-art conversion (V3).
- Second genre / game-type abstraction (V3).
- Supabase + auth + Stripe + moderation queue (V2).
