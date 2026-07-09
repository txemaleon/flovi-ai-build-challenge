# Demo Smoke Checklist

Use this checklist before publishing or sharing the Flovi demo.

## Local Fallback

- [x] Dispatcher local fallback exists and is covered by tests when Supabase env vars are absent.
- [x] Driver local fallback exists and is covered by Flutter tests when Supabase env vars are absent.
- [ ] Optional before presentation: run both local fallback apps manually if the hosted demo is unavailable.

## Supabase Demo Data

- [x] Supabase auth user exists for the real Google account used in the demo.
- [x] Demo data was seeded into the production Supabase project.
- [x] Seeded dataset includes open, booked, completed, and cancelled examples.
- [x] Seed script remains documented and env-driven: `npm run seed:demo`.
- [ ] Optional before presentation: reseed only if the demo data has been modified during rehearsal.

## Auth Redirects

- [x] Google OAuth provider is enabled in Supabase.
- [x] Supabase callback URL is allowed in Google OAuth.
- [x] Hosted dispatcher redirect URL is allowed in Supabase.
- [x] Hosted driver redirect URL is allowed in Supabase.
- [x] Supabase OAuth authorize endpoint returns `302` for both hosted redirect URLs.

## Hosted URLs

- [x] Dispatcher production URL returns HTTP 200.
- [x] Driver production URL returns HTTP 200.
- [x] Dispatcher production bundle contains the Supabase project reference.
- [x] Driver production bundle contains the Supabase project reference and driver redirect URL.
- [x] Dispatcher production login renders `Sign in with Google`.
- [x] Driver production bundle contains `Sign in with Google`.
- [ ] Manual rehearsal: sign in to dispatcher production and confirm seeded data, filters, edit/cancel flow, and visible status changes.
- [ ] Manual rehearsal: sign in to driver production and confirm available/booked/completed lists, filters, suggested next gigs, booking, and completion.

## Notes

- Flutter Web renders most driver UI through Flutter's web surface, so DOM-level smoke checks are limited. The responsive driver layout is covered by Flutter widget tests and screenshots in `docs/assets/ui-polish/`.
- Vercel production deployments were promoted manually from static app builds because these Vercel projects are not Git-linked.
