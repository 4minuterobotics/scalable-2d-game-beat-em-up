# Architecture

## Runtime engine — `/play/{slug}`

Vanilla JS canvas game. Entry: [canvas.js](../../canvas.js). Boot sequence:

1. Load game JSON via `loadGame(slug)` — reads `game.json`, `sounds.json`, `characters/*.json`, `stages/*.json` via `import.meta.glob`.
2. Hydrate referenced images (via [src/engine/assetResolver.js](../../src/engine/assetResolver.js)) and sounds (via [src/engine/AssetLoader.js](../../src/engine/AssetLoader.js)) — trim metadata applied here.
3. Instantiate `World` per stage; run the game loop.

V2 change: replace `loadGame` with a version that hits Supabase. Engine does not care where data came from.

## Editor — `/editor`

Svelte SPA. Entry: `editor.html` + `src/editor/main.js`. Routes (hash-based or path-based):

- `/editor` — game list.
- `/editor/{slug}` — selected game overview.
- `/editor/{slug}/character/{name}` — character editor.
- `/editor/{slug}/stage/{name}` — stage editor.
- `/editor/{slug}/sprite-sheets` — sprite sheet upload + animation frame selector.
- `/editor/{slug}/assets` — asset manager.

State: the currently-edited game lives in a Svelte store hydrated from the same JSON files the runtime reads. Mutations write back to disk via dev-server endpoints (debounced).

Live preview: editor and game run in separate tabs; Vite HMR detects JSON file changes and hot-reloads the game tab.
