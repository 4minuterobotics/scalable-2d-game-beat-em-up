# System Overview

Two surfaces, one codebase:

```
┌──────────────────────────────────────────┐
│     Browser                              │
│ ┌─────────────┐      ┌────────────────┐  │
│ │  /play/{s}  │      │  /editor       │  │
│ │  (canvas    │      │  (Svelte SPA)  │  │
│ │   runtime)  │      │                │  │
│ └──────┬──────┘      └───────┬────────┘  │
│        │                     │           │
│        └──── reads ──────────┤           │
│                              │  writes   │
└──────────────────────────────┼───────────┘
                               ▼
                  ┌────────────────────────┐
        V1        │  JSON files on disk    │
                  │  src/data/games/{s}/   │
        V2   ───▶ │  Supabase Postgres     │
                  └────────────────────────┘
```

- **V1**: both surfaces read from JSON files on disk. Editor writes via Vite dev-server middleware. No backend. No auth. One developer.
- **V2**: both surfaces read from Supabase. Editor writes via Supabase client SDK under row-level-security. Multi-tenant.

The migration from V1 → V2 is a 1:1 translation of JSON shape into SQL rows. No schema redesign; no runtime rewrite.
