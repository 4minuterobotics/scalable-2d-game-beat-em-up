# Open Technical Questions

- **Undo/redo granularity in the editor** — per-field, per-action, or snapshot-based? Build without first, add if painful.
- **Sprite sheet normalization** — enforce all sheets have a mirrored sibling at upload, or flip in-browser at runtime? Flipping at runtime via canvas is slower but lossless; pre-generating mirrors via Replicate costs 1 API call per upload.
- **Ad placements** — in-canvas banner, pre-roll video, or interstitial between stages? Test with one creator game at V2 launch.
- **Game state persistence** — should players' saves live in localStorage (V2 free tier) or Supabase (V2 paid)? Affects cross-device play.
- **Stripe pay-to-play UX** — one-time purchase or rental? Full game or per-stage? Let creator choose via the editor.
