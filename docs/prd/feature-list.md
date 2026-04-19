# V1 Feature List (prioritized)

## P0 — must ship

1. **Editor shell** — route at `/editor`, lists games, lists characters and stages for the current game. Writes via existing dev endpoint.
2. **Sprite sheet editor** — upload, set grid dimensions, overlay grid + numbers, select animations by frame range.
3. **Stage editor** — layers (add/remove, parallax, draw order), enemy waves, ending settings.
4. **Character editor** — stats, animation-to-input mapping, sound slot assignment.
5. **Image cropper** — Replicate bg-removal for character photos.

## P1 — should ship

6. Stage length + ending tunable from editor UI (already in schema).
7. Live preview — editor edits data; when the game is open in another tab, it hot-reloads and reflects changes.
8. Asset manager — list all images and sounds, show which characters/stages use each, delete unused.

## P2 — nice-to-have

9. Undo/redo per editor session.
10. Export/import a game as a single JSON bundle (for backup / sharing).
11. Quick-play preview — embedded canvas in the editor plays the game without leaving the editor screen.
