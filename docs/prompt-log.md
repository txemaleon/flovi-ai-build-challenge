# Prompt And Delivery Log

This is a curated trace of the key prompts, decisions, iterations, and verification checks used to build the Flovi relocation demo. It is not a full transcript; it records the prompts that materially changed the product or caught an issue.

## Starting Prompt

I started by framing the product as two connected apps around one operational workflow:

> Build a production-minded demo for a vehicle relocation workflow. The dispatcher creates and manages relocation requests. The driver sees available gigs, books them, and views booked work. Use Vue 3 for the dispatcher, Flutter for the driver, Supabase for auth/data/realtime, Google OAuth, a public repo, Vercel-hosted URLs where practical, conventional commits, and strong automated tests.

I also set engineering constraints upfront:

- keep domain logic separated from framework and infrastructure details,
- use context-first `domain/application/infra` style boundaries,
- work in small TDD slices,
- update a task board and delivery log as the project evolved,
- never commit real secrets.

The first useful slice was deliberately small: dispatcher create/list behavior at the application boundary. That avoided starting with UI before the model and persistence seams were clear.

## Foundation And Domain

Prompt:

> Implement only the smallest tested foundation for "a dispatcher creates a relocation request and can list it with available status." Use a repository port and in-memory adapter. Add the Supabase migration. Do not require real Supabase credentials in tests.

Result:

- Created the npm monorepo shape.
- Added `packages/core` with relocation domain and use cases.
- Added repository ports and an in-memory adapter.
- Added Supabase migration for `relocation_requests`.
- Added coverage tests for ID generation, default notes, and runtime UUID error paths.

What changed:

The first pass was missing some edge-case coverage. I asked for focused tests until TypeScript-owned source reached 100% statements, branches, functions, and lines.

Verification:

- `npm test`
- `npm run coverage`
- `npm run typecheck`

## Supabase Adapter

Prompt:

> Add a Supabase-backed repository adapter for dispatcher create and list. Use a fake Supabase client in tests. Keep the repository port stable and avoid network calls.

Result:

- Added `SupabaseRelocationRequestRepository`.
- Verified snake_case database mapping.
- Verified Supabase insert/select failures are wrapped with clear adapter errors.

What changed:

The adapter was kept behind a minimal structural client interface rather than leaking the concrete Supabase SDK through the domain/application layer.

## Dispatcher App

Prompt:

> Build a Vue 3 dispatcher foundation. A dispatcher can open the app, see a relocation dashboard, and create/list requests through the existing application boundary. Keep infrastructure behind an app-level service layer. Use fakes in tests.

Result:

- Added `apps/dispatcher`.
- Added a dashboard with create/list behavior, loading/empty/error states, and a local runtime.
- Added `DispatcherRelocationService` as the app-level boundary.

Issue caught:

The first UI version had auth as a fake button inside the dashboard. I moved auth responsibility into a shell component so workflow UI and session management stayed separate.

Follow-up prompt:

> Wire the dispatcher to real Supabase browser auth and persistence. Add Google OAuth sign-in, sign-out, current session handling, and auth subscription cleanup. Keep tests network-free.

Result:

- Added Supabase browser client composition.
- Added dispatcher auth service.
- Added authenticated Supabase persistence wiring.
- Added Data API grants through a migration.

## Dispatcher Editing

Prompt:

> Add the dispatcher edit workflow. Users can edit an existing relocation request, save changes, and see the refreshed list. Preserve status while editing fields.

Result:

- Added update use case and repository update contract.
- Added Supabase update adapter behavior.
- Added edit mode in the dashboard with save/cancel/error states.

Why it mattered:

Editing existing requests was part of the required dispatcher workflow, and keeping status immutable during normal edits prevented accidental lifecycle changes.

## Driver App

Prompt:

> Build the smallest Flutter driver app: a driver opens the app and sees available relocation gigs sorted by scheduled time. Use in-memory data first and Docker-backed Flutter verification.

Result:

- Added `apps/driver`.
- Added driver gig model/service boundary.
- Added available-gigs UI and Flutter tests.
- Added Docker-backed `driver:test` and `driver:build` scripts.

Follow-up prompt:

> Add booking. A driver taps one available gig, confirms it, and then sees it in booked gigs. Booking must be atomic at the repository port boundary and fail clearly if the gig is missing or no longer available.

Result:

- Added `booked` status and optional `driverId`.
- Added booking and booked-list use cases.
- Added atomic Supabase booking update.
- Added Flutter available/booked sections and booking tests.

Follow-up prompt:

> Wire the driver to real Supabase auth and data using Flutter `--dart-define` configuration. Keep in-memory fallback and tests.

Result:

- Added Supabase Flutter dependency and runtime config.
- Added driver auth boundary and Google sign-in.
- Added Supabase-backed available, booked, and booking behavior.

## Realtime And Lifecycle

Prompt:

> Add near-real-time refresh between dispatcher and driver through Supabase realtime subscriptions. Keep cleanup explicit and tested.

Result:

- Added dispatcher and driver realtime boundaries.
- Added Supabase realtime subscription wiring for `relocation_requests`.
- Added migration enabling realtime publication.

Prompt:

> Make the relocation lifecycle clear after booking: Open, Booked, Completed, Cancelled. Dispatcher can cancel. Driver can complete. Lists and filters must respect status.

Result:

- Added `completed` and `cancelled` states.
- Added dispatcher cancellation.
- Added driver completion and completed list.
- Added status summaries and filters.

Issue caught:

Client-side lifecycle checks were not enough. Direct database updates could still become a risk.

Follow-up prompt:

> Harden lifecycle authorization at the Supabase/database boundary. Add a migration that rejects invalid direct updates, preserves valid dispatcher edits/cancellations, driver bookings, and driver completions.

Result:

- Added a database trigger guard for `relocation_requests`.
- Protected dispatcher ownership, driver ownership, terminal states, and valid status transitions.

## Demo Data And Operational Filtering

Prompt:

> Populate the demo and make it operational. Add at least 28 relocation requests across Spain, cover all statuses, add dispatcher search/place/date/status filters, add driver origin/destination/date filters, and suggest next gigs based on the driver's latest destination.

Result:

- Added a reusable Spain-wide demo dataset.
- Added core filtering helpers.
- Added dispatcher autocomplete/search/date/status filtering.
- Added driver filters and suggested-next logic.
- Added Supabase seed script using env vars only.

Why it mattered:

The basic workflow worked, but the demo initially felt empty and did not show how drivers could chain work across cities. This slice made the product easier to evaluate as an operations tool.

## UI Polish

Prompt:

> Make Dispatcher and Driver feel like cohesive production-grade operations apps. Use a standard Google sign-in button. Use Tailwind for Dispatcher and mirror the same design tokens in Flutter. Remove tutorial-app styling, over-rounded controls, purple gradients, and awkward auto-width layouts.

Result:

- Added Tailwind CSS to the dispatcher.
- Added source-owned shadcn-style tokens and primitives.
- Reworked the dispatcher into a denser operations dashboard.
- Reworked the driver into a calmer mobile operations app.
- Replaced both Google sign-in affordances with a neutral, standard Google-style button.

Issue caught:

The first driver polish pass still did not use the full available width on larger screens.

Correction prompt:

> Available gigs must use the full width. Use 1 column on mobile, 3 columns on tablet and up, and 5 columns on desktop and up. Origin/Destination should be one filter row, From/To date filters another row. Add tests where feasible and recapture screenshots.

Result:

- Added responsive driver grid behavior.
- Added layout-focused Flutter widget tests.
- Recaptured UI screenshots under `docs/assets/ui-polish/`.

## CI, Deployment, And Delivery

Prompt:

> Add GitHub Actions verification and a demo smoke checklist. The workflow should run the existing test, coverage, typecheck, driver test, and driver build commands. No secrets and no deployment in CI.

Result:

- Added `.github/workflows/verify.yml`.
- Added artifact tests proving the workflow and smoke checklist include required checks.
- GitHub Actions passes on `main`.

Deployment work:

- Published the repository publicly on GitHub.
- Applied Supabase migrations.
- Configured Google OAuth through Supabase.
- Seeded production demo data.
- Deployed the dispatcher and driver to Vercel static projects.
- Rebuilt and promoted production assets manually because the Vercel projects are static-upload projects, not Git-linked projects.

Final delivery packaging:

- Added `README.md`.
- Added `docs/walkthrough-script.md`.
- Added `docs/reflection.md`.
- Added `docs/presentation-prep.md`.
- Added `docs/submission-checklist.md`.
- Added `docs/final-delivery-status.md`.

## Final Verification

Latest verified command set:

- `npm test`
- `npm run coverage`
- `npm run typecheck`
- `npm run driver:test`
- `npm run driver:build`

Latest GitHub Actions status:

- Workflow: `Verify`
- Latest checked run: https://github.com/txemaleon/flovi-ai-build-challenge/actions

Hosted smoke checks performed:

- Dispatcher URL returns HTTP 200.
- Driver URL returns HTTP 200.
- Production bundles contain the Supabase project reference.
- Driver production bundle contains the hosted redirect URL.
- Dispatcher renders `Sign in with Google`.
- Driver bundle contains `Sign in with Google`.
- Supabase Google OAuth authorize endpoint returns `302` for both hosted redirect URLs.

Remaining human work:

- Record the 5-minute walkthrough.
- Optionally rehearse manual sign-in on both hosted apps before the presentation.
- Send the live URLs and repository link before the presentation deadline.
