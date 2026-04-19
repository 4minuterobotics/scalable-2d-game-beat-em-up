# Changelog

Reverse-chronological log of notable changes. Kept current as part of each work session.

## 2026-04-19

### Sprite sheet editor
- **Footstep frame marking.** After selecting an animation range, a row of F0/F1/F2/… toggle buttons appears — click any to mark it as a footstep frame. Footsteps are saved into the animation as `footsteps: [...]` (sorted, animation-relative indices).
- **Shift+click** a cell inside the selected range to toggle it as a footstep. Footstep cells are drawn with a yellow overlay on the canvas.
- Pre-populates from the existing slot's footsteps when "Existing" mode is selected.
- Preview JSON now reflects footsteps live.
- Warns if the target character has no `soundSlots.step` mapped, with an inline **Add step slot** button that creates `soundSlots.step → "step"` (or the first available sound if `step` doesn't exist) and saves.
- **Bug fix:** save no longer overwrites `rate`, `loop`, `next`, `image`, `mirroredImage`, or any other existing field on the slot. Only sheet-derived fields (`row`, `startColumn`, `frames`, `sheet`, `footsteps`) are overwritten. New slots still get sensible defaults (`rate: 5`, `loop: true`, `image: <selected>`, `mirroredImage: <guessed left variant>`).

### Roadmap
- Added **Phase 1.8 — Stage items + solid-object collision** (stage-item cropper, placement, AABB collision runtime).
- Added **Phase 1.9 — Guided mode (walkthrough editor)** covering the step-by-step action-aware editing flow: create/edit character → action type → tailored form for locomotion vs. attack vs. projectile vs. reaction; stage flow → background/foreground vs. items.

### Character editor — sound slots
- **Add slot** button prompts for a slot name, creates a row defaulted to the first available sound.
- Per-row **×** button removes a slot.
- Renders slots in a compact grid with the slot name in monospace.

### Runtime — canvas-flip for left-facing multi-row sheets
- When an animation uses the per-anim `sheet`+`row`+`startColumn` format, the Animator now always reads from the right-facing sheet and returns a `flip: true` flag when direction is left. `Character.draw` honors the flag with `ctx.scale(-1, 1)` so the character draws mirrored without needing a separate mirrored sheet or fragile column-index math.
- Fixes the soldier disappearing when moving left (previously the mirrored sheet's col 0 mapped to the right-most column of the original, which was empty for an 8-frame run cycle).
- Hit-sprite overlays also flip along with the base when in flip mode.
- Legacy strip images (venom / neil) still use their hand-authored `mirroredImage` — no behavior change there.

### Difficulty system (Task 6)
- New top-level `game.difficulty` (integer, default 1). Exposed from `loadGame` to runtime and editors.
- Per-wave `countPerDifficulty` and `countJitter` in stage JSON. Actual spawn count: `count + countPerDifficulty * (difficulty - 1) + randInt(0..countJitter)`. Rounded and clamped ≥ 0.
- **TuningPanel** (press T): new **Difficulty** slider (1-10). On change, persists to `game.json` via `/_dev/save-game`. Takes effect on the next stage reload (reset stage or pick a new one from the Stage dropdown to apply immediately).
- **StageEditor**: each wave now shows inputs for "count (at difficulty 1)", "+ per difficulty", and "count jitter". Defaults are 0 so existing stages keep their fixed counts.
- Backward-compatible: stages with no difficulty-scaling fields render identically to before.

### Sprite sheet editor — projectile + explosion ranges (Task 5)
- Three separate selection ranges per save: **Main** (character animation, existing), **Projectile** (flying bullet/fireball frames, optional), **Explosion** (collision/impact frames, optional).
- Tab bar above the hint lets the user switch which range is active. Clicks on the canvas apply to the active range. Each range draws with its own color: green (main), blue (projectile), orange (explosion).
- Ranges serialize under the animation as `projectile: { row, startColumn, frames }` and `explosion: { row, startColumn, frames }` alongside the existing main fields. Omitted when unset.
- Pre-populates projectile/explosion on load from an existing slot.
- Summary line shows the frame count and row for each range. Shift+click footstep toggle remains scoped to the main range.

### Runtime — multi-row sheet support
- `Animator.getDrawInfo` now understands the per-animation `sheet` + `row` + `startColumn` data that the sprite sheet editor saves. Previously the runtime only supported single-row strip images and hardcoded `sy: 0`, so animations authored against a multi-row grid (e.g., `img/scalableCharacters/Soldier_1_Spritelist.png` with 19 cols × 10 rows) drew from row 0 regardless of which slot was active, with stride `config.frameWidth` instead of the actual cell size.
- New resolution order: (1) per-anim `sheet` + `row` (new editor output), (2) per-anim `image`/`mirroredImage` strip (venom legacy), (3) character-level `sheet` + per-anim `row` (older legacy). First match wins. Backward-compatible with all existing character JSON.

### Sprite sheet editor — mirror detection
- **Auto-detect right/left image pair** from the picked image, validated against actual files under `/img/**`. Handles:
  - `name-right-sheet.png` ↔ `name-left-sheet.png` (word-boundary replace)
  - `Sheet.png` ↔ `Sheet_mirrored.png` (underscore-suffix convention used in `img/scalableCharacters/`)
- Picking either variant yields the correct `image` (right) + `mirroredImage` (left) pair on save — no more manual edit in CharacterEditor.
- Preview shows the detected pair inline; flags if no mirrored variant was found ("same as right").
- Applies to both new and existing slots (existing slots' `image`/`mirroredImage` are now updated when you re-save with a different sheet).

### Character creation
- **+ New** button in GameOverview's Characters panel. Prompts for name + kind (player/enemy), scaffolds a minimal character JSON via `/_dev/save-character`, navigates to the sprite-sheet editor so the user can immediately add an `idle` animation.
- Enemy skeleton includes a default `ai` block (detectRange, stop, stopJitter, speech fields empty).
- Player/enemy kinds get sensible speed/health defaults; user can edit later in CharacterEditor.

### Input bindings editor
- New route [InputBindings.svelte](../src/editor/routes/InputBindings.svelte) at `/editor.html#/{slug}/inputs`. Each action shows its keys as clickable chips — click a chip to remove, click **+ key** and press a key to bind.
- Rename an action by clicking its name. Remove an entire action with its row-level **Remove** button.
- Keys normalize ArrowUp/Down/Left/Right → `up/down/left/right` and space → `space` to match the runtime's `Input.js` naming.
- Saves via `/_dev/save-game` (updates `game.json`'s `inputBindings`).
- **CharacterEditor** — input-action rows now come from `game.inputBindings` keys (not from each character's own `inputActions`), so new actions automatically show up per character with a dropdown to bind to an animation slot or "(none)" to leave that character unresponsive to the action. Added a link back to the Input Bindings page.
- **GameOverview** — new "Input bindings" link in the Assets panel with action count.

### Role-agnostic characters + player swap
- Runtime's `kind === 'enemy'` filter in [canvas.js](../canvas.js) is gone — any character may be used as the player or as an enemy wave. `character.kind` is now a hint, not a gate.
- Player character switcher in [GameOverview.svelte](../src/editor/routes/GameOverview.svelte) — dropdown next to "Player:" writes `playerCharacter` into `game.json` via `/_dev/save-game`.
- Tuning Panel adds a "Player character" dropdown (Actions section) for live in-game swap. Selecting a new character reloads the current stage with that character as the player.
- [StageEditor.svelte](../src/editor/routes/StageEditor.svelte) wave-character dropdown now lists every character with its `kind` annotated.

### Roadmap
- Restructured [ROADMAP.md](ROADMAP.md) Phase 1 sections to reflect new scope: role flexibility (1.2), input bindings + action expansion (1.3), sprite-sheet projectile/explosion ranges (1.4), difficulty system (1.5), take-damage runtime (1.6), projectile runtime (1.7). Remaining editor polish moved to 1.8.

## 2026-04-18 (p.m.)

### Sprite sheet editor
- **"Save to character" dropdown** — after selecting a frame range, the editor can now merge the generated spec directly into a character's animations via `/_dev/save-character`, instead of requiring a copy-paste into CharacterEditor. Picks: character name, existing slot or new slot name. Existing slots are merged (preserves fields outside the sheet spec like `attack`, `footsteps`, `next`).

### Runtime bug fixes
- **Enemies stacking on the same pixel when stopped** — added per-instance `ai.stopJitter.{x,y}` in character JSON. AIController picks a random positive offset once on spawn and adds it to `stop.{x,y}`. Spreads enemies across a configurable standoff range. Applied `stopJitter: { x: 40, y: 30 }` to `neil.json`.
- **Player sprite disappears for a frame on contact** — `Animator.getDrawInfo` was swapping the base sprite for the contact sprite. Split into two calls: `getDrawInfo` always returns the base, `getHitOverlayInfo` returns the FX layer. `Character.draw` composites the overlay on top of the base so the character stays visible.
- **Glitchy stage transitions** — `onStageComplete` and `onPlayerDead` were firing every frame between detection and the async `setScene` swap, spawning duplicate stage loads and (for complete) incrementing `stageIndex` multiple times. Added a `world._transitioning` one-shot flag.
- **AI run animation continuing after arriving next to the player** — symmetric stop-jitter could push `stopY` near zero, causing enemies to hunt the player's Y in a tiny deadband. Changed jitter to positive-only so the deadband can only widen, never shrink.

### Tuning panel
- **Stage picker dropdown** added to the Actions section. Press `T` → pick any stage from `game.stageOrder` → it reloads into that stage. Reflects the current stage as selected.

## 2026-04-18

### Roadmap + decisions
- Added [ROADMAP.md](ROADMAP.md) — ordered, step-by-step build plan covering Phase 1 (finish V1) → Phase 5 (steady-state platform), with transition gates between phases. Linked from [PRD](PRD.md), [EDD](EDD.md), and project [CLAUDE.md](../CLAUDE.md).
- Trimmed project [CLAUDE.md](../CLAUDE.md) to only project-specific content; generic preferences now live in the parent CLAUDE.md.
- Converted [prd/open-questions.md](prd/open-questions.md) from open questions → recorded decisions:
  - **Moderation:** manual (founder) at V2 launch → automated scan + human queue later → contract moderator once volume demands it.
  - **Photo/consent policy:** signed consent is the default requirement; minors never allowed (hard rule); takedown requests mandatory and honored within 48h; each consent requirement (signed consent, photo ID, notarized consent, age attestation) is a toggle in a `photo_upload_policy` config so the founder can adjust per jurisdiction. TOS/consent legal language still pending lawyer review before public sign-ups.
  - **Ad network:** AdSense at V2 launch; switch to Ezoic at ~10k monthly pageviews.
  - **Sprite mirroring:** flip in-browser at runtime via canvas transform — no pre-generated mirrored sheets, no Replicate call.
  - **Ad placements:** frequency-capped interstitial between stages (~1 per 2–3 stages) + static banner below the canvas. No pre-roll.

### Documentation
- Split [PRD](PRD.md) and [EDD](EDD.md) into section files under `docs/prd/` and `docs/edd/`.
- Created [PROJECT_STATUS.md](PROJECT_STATUS.md) as the living source-of-truth for what's done, in progress, and next.
- Linked all docs from the repo-root [CLAUDE.md](../CLAUDE.md).

### Sprite sheet editor
- [SpriteSheetEditor.svelte](../src/editor/routes/SpriteSheetEditor.svelte) at `/editor/#{slug}/sprite-sheets`.
- **Upload**: file input → `/_dev/upload-asset` writes to `img/` (new endpoint, size-capped at 50 MB, filename + subdir validated).
- **Grid overlay**: pick any image from `/img/**`, set `columns`/`rows`, canvas overlays numbered grid lines + row,col labels.
- **Frame range selection**: click two cells; selection highlight + error if the range crosses rows.
- **Animation spec**: live-generated JSON snippet (row / startColumn / frames / sheet metadata) with a copy-to-clipboard button. User pastes it into the character's animation block in CharacterEditor.

### Image cropper + background removal (Replicate)
- [ImageCropper.svelte](../src/editor/routes/ImageCropper.svelte) at `/editor/#{slug}/crop`.
- Upload photo → auto-centered square crop rectangle → drag the box or corner handles to adjust → edit x/y/w/h numerically.
- Name the output file → "Crop + remove background" → client-side canvas crop → POST data URI to `/_dev/crop-and-rembg`.
- New dev endpoint `/_dev/crop-and-rembg` calls Replicate `cjwbw/rembg`, fetches the transparent-PNG result, writes to `img/{filename}`. Returns `{ path, bytes }`.
- Endpoint fails with clear message if `REPLICATE_API_TOKEN` env var is not set.
- Installed `replicate` npm package as devDependency.
- Result preview shows on a checkerboard background so transparency is visible.

### Stage editor
- [StageEditor.svelte](../src/editor/routes/StageEditor.svelte) — full editing of stage JSON:
  - Top-level settings: display name, `lengthTiles`, `tileWidth`, derived total length.
  - Ending block: `type` (music / boss / cutscene — only music implemented in runtime for now), `tileCount`, `durationMs`, `music` (dropdown from sounds).
  - Layers: add / delete / collapse. Per-layer: `id`, `parallax`, `drawOrder`, `depth` (background / foreground). Items within layers: image path, `x/y`, explicit `width/height`, `widthScale/heightScale`, `count`, `spacing` / `spacingScale`. Add / remove items.
  - Enemy waves: add / delete. Per-wave: `character` (dropdown of enemy-kind characters), `count`, `x`, `xJitter`, `yMin/yMax`, `speed`, `health`.
- Wired into `/editor/#{slug}/stage/{name}` route.

### Animation editor (inside CharacterEditor)
- Rebuilt [CharacterEditor.svelte](../src/editor/routes/CharacterEditor.svelte) to bind directly to a cloned character JSON.
- Per-animation editable block (collapsible) exposing: `frames`, `rate`, `loop`, `next`, `frameOffsetX`, `footsteps[]`, `isProjectile`, `isCollision`, `image`, `mirroredImage`.
- Attack sub-block (per-animation) editing `width`, `height`, `damage`, `hitFrame`, `sounds.{start, startVoice, hit}`, `hitSprite.{image, mirroredImage}`. Add / remove attack per animation.
- Input actions section — each abstract action binds to an animation via dropdown.
- Sound slots section — each slot binds to a sound name from `sounds.json` via dropdown.
- AI section (if present) — editable `detectRange`, `stop.{x,y}`, `speechChance`, `speechLines`.

### Editor scaffold
- Installed `svelte@5.x` and `@sveltejs/vite-plugin-svelte@4.x` (plugin v7 wasn't compatible with Vite 5 — pinned v4).
- Added `editor.html` as a second Vite entry point (multi-page app; game stays at `/`, editor now at `/editor.html`).
- Built Svelte app under `src/editor/`:
  - `main.js` mounts `App.svelte`.
  - `lib/router.js` — minimal hash-based router with param matching.
  - `lib/gameFiles.js` — discovers games + their JSON files via `import.meta.glob`.
  - `lib/api.js` — wrappers for the dev-server write endpoints.
  - `routes/GameList.svelte` — lists games from `src/data/games/*`.
  - `routes/GameOverview.svelte` — selected game: characters, stages, assets, settings.
  - `routes/CharacterEditor.svelte` — edits top-level character stats (kind, speed, health, draw/frame dims, offsets, start direction/animation). Shows animations + input actions + sound slots read-only until deeper editors land.
  - `routes/Placeholder.svelte` — stub for routes not yet built (stage, sprite-sheets, sounds).
- Dev server confirmed serving `editor.html` at `/editor.html` (200).

### Bug fixes
- **Enemies (Neils) not spawning** — field name mismatch after the JSON migration. Stage JSONs use `"character": "neil"` but `loadStage.spawnEnemies` was reading `wave.type`. Fixed to read `wave.character ?? wave.type`.
- **Neil speech delayed** — AIController only spoke via random `speechChance` per frame (~5.5s average delay). Now fires one line on the transition from "moving" to "stopped" (i.e., the moment Neil reaches stop range next to the player), matching the old pre-refactor behavior. Random-chance speech remains for ambient variety while stopped.
- **Start of game delayed, first animation missing** — two causes:
  1. `loadGame()` was eagerly hydrating all 4 stages at boot. Switched to lazy per-stage loaders; only stage 0 loads when you click Start.
  2. Venom's 20-frame "transform-in" animation from the old codebase was dropped during the refactor. Restored as `animations.start` in `venom.json`, with `startAnimation: "start"` and `next: "idle"`.

### Tuning panel → disk
- New **💾 Save all tuning to disk** button in the T-panel Actions section. Collects live values, fetches the source JSONs, applies the updates, and POSTs to the save endpoints:
  - `game.json` — `bounds.{topY, bottomY}`, `camera.{bandLeft, bandRight}` (new field).
  - Current stage JSON — `layers[].parallax` (matched by layer id).
  - Player character JSON — `speed`, `health`, `spriteCenterOffset`, per-animation `rate`, per-attack `{width, height, damage, hitFrame}`.
  - Enemy character JSONs (deduped by name) — `speed`, `health`, `ai.{detectRange, stop.x, stop.y}`.
- Runtime now reads `camera.bandLeft` / `camera.bandRight` from `game.json` when set (falls back to Camera defaults).
- Status line under the button shows which files were written or the error if it failed.

### New dev endpoints
- `/_dev/save-character` — writes `characters/{name}.json`.
- `/_dev/save-stage` — writes `stages/{name}.json`.
- `/_dev/save-game` — writes `game.json`.
- All validate `gameSlug` + entity-name regex, `apply: 'serve'` only (not in prod builds).
- Round-trip verified: read Venom config, POST it back, file is byte-identical except for formatting.

### Product decisions
- Locked in answers to the five PRD clarifying questions: stage-ending types (music / boss / cutscene with `music` default), artist model (founder personal + future AI resale), creator monetization (ads + Stripe pay-to-play with per-tier revenue share, founder as merchant of record), beat-em-up-only for V1, Replicate-based bg-removal for character photos.

### Schema
- Added `stage.ending` block with `type` discriminator; migrated all 4 existing stage JSONs.
- Updated `loadGame.js` to hydrate the new shape.

## 2026-04-17

### Data model migration
- Migrated hardcoded character and stage configs into JSON files under `src/data/games/township/`.
- Built `src/engine/loadGame.js` — single entry point that hydrates the game from JSON.
- Built `src/engine/assetResolver.js` — uses `import.meta.glob` to resolve asset paths to bundled URLs.
- Deleted obsolete JS data files (`venom.js`, `neil.js`, `stage*.js`, `soundTrims.json`, `inputBindings.js`).
- Updated the `/_dev/sound-trims` endpoint to write trim metadata into the per-game `sounds.json`.

### Audio
- Replaced destructive file overwrite with non-destructive trim metadata (stored in `sounds.json`, applied via Howler sprites).
- Removed `@breezystack/lamejs` — no longer re-encoding audio.
- Added `/_dev/sound-trims` dev-server endpoint that updates `sounds.json`.

### Tooling
- Added in-game **tuning panel** (toggle with `T`): camera band, bounds, player stats, per-attack hit params, enemy AI, parallax rates, and per-sound volume.
- Added **audio trimmer** modal (✂ in tuning panel): decoded waveform, draggable markers, preview, save/restore, export WAV.

## Earlier

- Refactored from ~1900-line monolithic `canvas.js` into engine + game + characters + controllers + data split across `src/`.
- Game is vanilla JS + Vite + Howler.
- Four stages implemented: Alien Spaceship, South Beach, Tijuana, Wrigleyville.
- Two characters implemented: Venom (player), Neil (enemy).
