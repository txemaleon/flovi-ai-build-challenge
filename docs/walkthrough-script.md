# 5-Minute Walkthrough Script

Use this as the recording script and live presentation flow. Keep the pace direct: show the product first, then mention architecture and verification only at the end.

## 0:00-0:30 - Setup

Open with the goal:

> This is a two-sided Flovi relocation workflow. Dispatchers create and manage vehicle relocation requests. Drivers see available gigs, book one, and complete it. Both apps share Supabase auth, data, and realtime updates.

Show the two URLs:

- Dispatcher: https://flovi-dispatcher.vercel.app
- Driver: https://flovi-driver.vercel.app

## 0:30-1:40 - Dispatcher Flow

1. Open the dispatcher app.
2. Show the Google sign-in button.
3. Sign in or use the existing session.
4. Point out the dashboard:
   - create request form,
   - status counts,
   - search and place filters,
   - date window filters,
   - open/booked/completed/cancelled status badges.
5. Create a new relocation request:
   - origin: Madrid
   - destination: Barcelona
   - scheduled date/time: use a near-future date
   - notes: short operational note.
6. Show it appears in the list as open.
7. Edit the request and change one field.
8. Save and show the list refresh.

What to say:

> I pushed the dispatcher toward an operations dashboard: dense enough to scan, but still simple. The key workflow is create, inspect, filter, edit, and cancel.

## 1:40-3:10 - Driver Flow

1. Open the driver app.
2. Show Google sign-in.
3. Show available gigs.
4. Point out the filters:
   - origin and destination in one row,
   - from/to dates in the next row.
5. Show the available gigs grid:
   - one column on mobile,
   - three columns on tablet,
   - five columns on desktop.
6. Book one available gig.
7. Show it moves into booked gigs.
8. Complete it.
9. Show it in completed gigs.

What to say:

> The driver app is optimized for choosing work quickly: route, pickup time, status, and one clear action. The suggested-next logic supports chaining gigs when a driver finishes in another city.

## 3:10-3:50 - Sync And Backend

Show dispatcher again and refresh or wait for realtime update.

Mention:

- Supabase Auth handles Google OAuth.
- Supabase Postgres stores relocation requests.
- Realtime subscriptions refresh both apps.
- RLS and database guards enforce lifecycle transitions even if the API is called directly.

What to say:

> The apps do not just fake local state. The hosted demo is backed by Supabase, and lifecycle rules are enforced at the database boundary.

## 3:50-4:30 - Engineering Quality

Open the repository briefly:

- show `apps/dispatcher`,
- show `apps/driver`,
- show `packages/core`,
- show `supabase/migrations`,
- show `.github/workflows/verify.yml`.

Mention:

- vertical slices,
- TDD red-green-refactor,
- 100% TypeScript-owned coverage,
- Flutter widget tests,
- GitHub Actions verification.

## 4:30-5:00 - Close

Close with:

> The main tradeoff was using Flutter Web as the demo delivery format, which keeps the mobile app accessible by URL. With another hour I would add deeper end-to-end browser tests against the deployed Supabase environment and polish the production smoke automation.

End by showing:

- repo URL,
- dispatcher URL,
- driver URL.
