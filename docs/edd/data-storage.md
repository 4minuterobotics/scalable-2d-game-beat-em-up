# Data Storage

## V1 — JSON files on disk

```
src/data/games/
  {slug}/
    game.json                         # top-level: slug, title, viewport, bounds, playerCharacter, stageOrder, inputBindings
    sounds.json                       # name → { fileUrl, trim? }
    characters/
      {name}.json                     # one file per character
    stages/
      {name}.json                     # one file per stage
```

**Rules:**

- One game per `{slug}/` directory.
- Character + stage JSON files reference assets by project-root path (e.g. `img/bluePipes.png`), resolved by `assetResolver.js` at boot.
- Sound trim metadata lives inline in `sounds.json` and is edited by the `/_dev/sound-trims` endpoint.

## V2 — Supabase Postgres

Schema draft in [../../src/data/schema.md](../schema.md) (to be generated from the design work already done). Tables:

- `creator`, `game`
- `sprite_sheet`, `stage_asset`, `sound`
- `character`, `animation`, `character_sound`
- `stage`, `stage_layer`, `stage_layer_item`, `enemy_wave`
- `subscription` (platform phase)

**Row-level security** policies ensure creators can only edit rows where `creator_id = auth.uid()`. Public read granted for games with `published_at IS NOT NULL`.

Blob storage (images, audio) uses Supabase Storage with per-creator buckets.

## Migration V1 → V2

1:1 translation. Each JSON file becomes one or more rows in Postgres, file paths become Supabase Storage URLs, `creator_id` is populated once auth exists. No schema redesign required — the JSON shape was designed against this target.
