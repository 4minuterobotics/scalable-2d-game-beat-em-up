# Decisions (previously Open Questions)

Decided 2026-04-18. Keep this file at the same path — the PRD and ROADMAP link to it. If any decision gets reopened, convert that entry back to a question and note what triggered the re-think.

---

## 1. Moderation staffing

**Decision:** Manual review by the founder at V2 launch. Then automated scanning as a first-pass filter, with the founder working the human queue. Hire a contract moderator after that.

**Implementation notes:**

- V2 launch: every "publish" request creates a row in a `moderation_queue` table. Founder sees a dashboard at `/admin/moderation`. Approve / reject with a reason. Rejection emails the creator.
- Phase 2 of moderation: integrate an automated scanner (NSFW detection, image hash match against known stolen sprites, OCR for banned text). Scanner auto-rejects obvious violations; borderline cases land in the human queue.
- Phase 3: hire an hourly contractor once the queue exceeds what the founder can handle in a working day.

---

## 2. Legal / TOS for user-uploaded photos of real people

**Decisions:**

- **Minors are never allowed.** Hard rule. No photos of anyone under 18, even with parental consent. Enforced via attestation at upload + content moderation.
- **Signed consent is the default requirement** for any photo of a real person.
- **"No photo required" is a valid alternative path** — a user can opt out of uploading photos entirely and use illustrated sprites only.
- **Each consent/attestation item must be toggleable by the founder (admin)** — whether a given item is required, optional, or hidden should be a per-deployment config, because different states and jurisdictions have different requirements.
- **Takedown requests are mandatory.** Anyone (subject of a photo, copyright holder, parent) can request removal. Honored within 48 hours. Removed content is hard-deleted from storage, not just hidden.

**Implementation notes:**

- `photo_upload_policy` config table. Rows like `signed_consent_required`, `photo_id_required`, `notarized_consent_required`, `age_attestation_required`. Each has `enabled` (boolean) and `required` (boolean). Founder toggles via admin UI. Default config: signed consent `enabled = true, required = true`; the rest `enabled = false`.
- At upload time the editor checks the active policy and enforces the `required = true` items. Files collected as consent documents go to a private Supabase Storage bucket, never public.
- Minors: enforced two ways — (a) attestation checkbox "every person in this image is 18+", (b) moderation reviewer rejects anything that looks like a minor regardless.
- Takedown form: public URL `/legal/takedown`. Submissions land in the same `moderation_queue` with type `takedown`, prioritized.
- **Still needed before real launch:** pay a lawyer ($500–1500) familiar with edtech/UGC to draft the actual TOS + consent language. Do not ship public sign-ups until this is done.

---

## 3. Ad network

**Decision:** AdSense at V2 launch. Switch to Ezoic once traffic qualifies.

**Implementation notes:**

- V2 launch: AdSense account, site review, ad units placed per decision #5.
- Monitor monthly pageviews. At ~10k/month, open an Ezoic application. Ezoic wraps AdSense + other networks and usually pays 1.5–3x.
- Don't pursue Mediavine / Raptive until 50k+ monthly sessions — not a V2 concern.

---

## 4. Sprite-sheet mirroring

**Decision:** Flip in-browser at runtime. No pre-generated mirrored sheets.

**Implementation notes:**

- Rendering code uses a horizontal canvas transform (`ctx.scale(-1, 1)` with an X offset) when drawing left-facing frames. Performance cost is negligible.
- No storage doubling. No extra upload pipeline step. Replicate API calls are reserved for genuine image work (background removal, AI generation), not mirroring.

---

## 5. Ad placements

**Decision:** Interstitial between stages, with a static banner below the canvas as a secondary placement. No pre-roll.

**Implementation notes:**

- Interstitial: full-screen ad fires between stages at the natural gameplay pause. Skippable after 5 seconds. Frequency-capped so the same player doesn't see an ad between *every* stage — target ~1 per 2–3 stages.
- Banner: static ad strip below the game canvas, visible throughout play.
- No pre-roll. Pre-game ads cause players to bounce before they engage.
- Paid tiers can opt the creator's games out of ads entirely — creator's choice, enforced at the tier level (see [pricing-tiers.md](pricing-tiers.md)).

---

## Still open (genuinely)

Nothing at the moment. If a new uncertainty comes up, add it back above with a clear question and the options being considered.
