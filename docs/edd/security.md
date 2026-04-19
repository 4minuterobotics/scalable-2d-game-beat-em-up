# Security

## V1

- Vite dev middlewares validate inputs (regex on slugs, filenames, extensions).
- Only listen on localhost.
- Production build **does not include** these endpoints (`apply: 'serve'` in the Vite plugin).

## V2

- All writes gated by Supabase **row-level security** tied to `auth.uid()`.
- **Stripe webhook** validates signature before processing.
- User-uploaded assets scanned via Cloudflare Images malware scan.
- **Moderation queue** approves any new public game before it becomes visible at `/play/{slug}`.

## Legal

- Creator-uploaded photos of real people require an attestation checkbox at upload time ("I have rights to use this image"). Stored in audit log.
- **DMCA takedown** contact in site footer.
- Terms of Service covers likeness rights, IP, content standards.
- Consult with counsel before V2 launch — especially around children's data (COPPA implications if educational content spreads to minors).
