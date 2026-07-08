# Demo Smoke Checklist

Use this checklist before publishing or sharing the Flovi demo.

## Local Fallback

- [ ] Start the dispatcher without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; confirm the local fallback dispatcher opens with demo relocation data and filters work.
- [ ] Run the driver without `SUPABASE_URL` and `SUPABASE_ANON_KEY`; confirm the local fallback driver opens with demo gigs, filters, and suggested next gigs.

## Supabase Demo Data

- [ ] Create or choose Supabase auth users for the dispatcher and driver demo accounts.
- [ ] Run `npm run seed:demo` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_DISPATCHER_USER_ID`, and `DEMO_DRIVER_USER_ID`.
- [ ] Set optional `DEMO_SECONDARY_DRIVER_USER_ID` when seeded booked or completed examples should show a second assignment.

## Auth Redirects

- [ ] In Google OAuth, confirm the Supabase callback URL is allowed: `https://<project-ref>.supabase.co/auth/v1/callback`.
- [ ] In Supabase Auth URL configuration, confirm hosted dispatcher and driver redirect URLs are allowed.

## Hosted URLs

- [ ] Open the hosted dispatcher URL and confirm sign-in/config state, demo data or seeded data, filters, realtime refresh, and lifecycle actions.
- [ ] Open the hosted driver URL and confirm sign-in/config state, available/booked/completed lists, filters, suggested next gigs, booking, completion, and realtime refresh.
