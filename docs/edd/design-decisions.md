# Key Design Decisions

## 1. Editor is Svelte; runtime is vanilla JS

Different problems, different tools. The editor is CRUD + state management — Svelte wins. The runtime is a hot loop with frame budgets — vanilla JS keeps the bundle small and call sites direct.

## 2. JSON files as V1 storage (not SQLite, not a local backend)

Zero new infra, zero new runtime dependencies. Vite's file watching handles reloads for free. The JSON format is the Postgres schema shape, so migration is mechanical.

## 3. `import.meta.glob` for asset and JSON discovery

Means adding a new game/character/stage is just dropping a file; no registration. Tradeoff: bundle includes all assets under the glob — fine for V1, revisit for V2 (where assets come from blob storage URLs).

## 4. Path-routed single app (not subdomains)

Reduces DNS + SSL + hosting complexity. Top tier in V2 pricing can unlock custom domains.

## 5. Founder as Stripe merchant-of-record (not Stripe Connect)

Massively simpler onboarding (no KYC per creator). Tradeoff: all payments flow through the founder's business, including tax liability. Acceptable at V2 scale; revisit at V3.

## 6. Ship beat-em-up only; generalize at V3

Premature genre abstraction is worse than a migration later. When the fork-in-the-road genre is added, introduce a `game_type` discriminator and a per-genre sub-schema.

## 7. Non-destructive audio trims (metadata in sounds.json, not file overwrite)

Original files stay intact; trim is a `{ startMs, endMs }` on the sound entry. Playback applies the trim via Howler sprites. Creator can undo to the full original with one click.
