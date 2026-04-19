# Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Editor UX gets clunky, founder avoids it | Build tuning panel first (already done); editor is the incremental expansion. Iterate on UX by actually using it. |
| Sprite-sheet format doesn't fit a user's real sprite sheet | Schema supports both strip-mode and grid-mode; uploads let users declare columns/rows. |
| Replicate API latency makes bg-removal feel slow | Show progress + let user cancel; cache results per source image. |
| V2 Stripe tax / regulatory burden on founder | Use Stripe Tax; incorporate as LLC before launch; consult accountant. |
| Moderation becomes a bottleneck | Start with 100% manual review; automate obvious-bad filtering (nudity / violence classifiers via Replicate) at scale. |
| V1 JSON schema drifts from planned Postgres schema | Validate JSON against a JSON Schema on every dev-endpoint write; fail loudly if a field is unknown or missing. |
| Creator-uploaded photos expose platform to likeness claims | Attestation checkbox + moderation + DMCA process + published TOS. |
| Game runs poorly on low-end devices | Profile on a baseline device; cap parallax layers + enemy count per stage. |
