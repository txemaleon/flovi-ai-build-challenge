# Flovi Prompt And Delivery Log

## 2026-07-08 - Initial Scope

The requested product is a production-minded demo for a vehicle relocation workflow:

- Dispatcher web app in Vue 3.
- Driver app in Flutter, with Flutter web acceptable for the demo.
- Shared Supabase backend for auth, database, and realtime updates.
- Google OAuth configured through Supabase.
- Context-first domain/application/infra boundaries with simple DDD and hexagonal structure.
- TDD vertical slices, conventional commits, task board, and concise delivery logging.

Decision: start with a shared TypeScript core package and implement the first behavior at the application/use-case boundary before adding UI or Supabase runtime adapters.

## 2026-07-08 - Slice 1

Prompt: implement only the smallest tested foundation for "A dispatcher creates a relocation request and can list it with `available` status."

Constraints:

- Update this log and `docs/task-board.md` before coding.
- Do not require real Supabase credentials to run unit tests.
- Use a repository port and in-memory adapter for the test.
- Add Supabase schema/migration for the relocation request table.
- Do not expose or require a Google OAuth client secret in runtime app env.

Verification results will be added after the slice is implemented.

Delivery:

- Created a minimal npm workspace with `packages/core` for shared TypeScript application logic and placeholder app boundaries for dispatcher and driver.
- Added an application-boundary behavior test for dispatcher create + list relocation requests.
- RED result: `npm test` failed because `packages/core/src/relocations/index.js` did not exist yet.
- GREEN result: implemented relocation request domain factory, create/list use cases, repository port, and in-memory adapter.
- Added Supabase migration for `public.relocation_requests` with `available` status and row-level security policies.
- Added `.env.example` with only public client runtime variables and Supabase project metadata.
- Coverage gap correction: an initial 92.85% statement/line and 66.66% branch result was caught before publishing. Focused tests were added for injected ID generation, default notes, and the missing runtime UUID error path.
- Verification: `npm test` passed with 1 test file and 3 tests.
- Verification: `npm run coverage` passed with 100% statement coverage, 100% branch coverage, 100% function coverage, and 100% line coverage.
- Verification: `npm run typecheck` passed.

## 2026-07-08 - Slice 2

Prompt: implement only the core/backend foundation for "The relocation request application boundary can use a Supabase-backed repository adapter for dispatcher create + list, without requiring real credentials in tests."

Constraints:

- Update this log and `docs/task-board.md` before coding.
- Do not start the Vue UI.
- Use a fake/stub Supabase client in tests and never call the network.
- Keep the existing `RelocationRequestRepository` port unchanged if possible.
- Prefer a minimal structural Supabase client interface over a concrete SDK dependency.
- Preserve compatibility with the existing `relocation_requests` migration unless a SQL adjustment is necessary.
- Require 100% statements, branches, functions, and lines for owned source before committing.

Planned tests:

- `save()` inserts a domain relocation request into `relocation_requests` with snake_case columns.
- `list()` reads Supabase rows and maps them back into domain relocation requests.
- Supabase insert and select failures are surfaced with clear adapter errors.

Verification results will be added after the slice is implemented.

Delivery:

- Added focused Supabase repository adapter tests with a fake in-memory Supabase client, so no credentials or network calls are required.
- RED result: `npm test` failed because `SupabaseRelocationRequestRepository` was not implemented/exported yet.
- GREEN result: implemented `SupabaseRelocationRequestRepository` under `packages/core/src/relocations/infra` using a minimal structural Supabase client interface.
- Kept the existing `RelocationRequestRepository` port unchanged.
- Verified `save()` inserts into `relocation_requests` using `id`, `dispatcher_id`, `origin`, `destination`, `scheduled_at`, `notes`, and `status`.
- Verified `list()` selects those columns, orders by `scheduled_at`, and maps rows back to domain relocation requests.
- Verified Supabase insert and select failures throw clear adapter-level errors.
- Migration compatibility: no SQL changes were needed because the existing migration already uses the table and snake_case column names required by the adapter.
- Verification: `npm test` passed with 2 test files and 7 tests.
- Verification: `npm run coverage` passed with 100% statement coverage, 100% branch coverage, 100% function coverage, and 100% line coverage.
- Verification: `npm run typecheck` passed.

## 2026-07-08 - Slice 3

Prompt: implement only the dispatcher Vue 3 app foundation for "A dispatcher can open a Vue 3 web app, see a polished relocation dashboard, and create/list relocation requests through the existing application boundary without real Supabase credentials in tests."

Constraints:

- Keep the slice focused on `apps/dispatcher` plus only shared/core changes needed by the UI.
- Do not build the driver app.
- Do not write real secrets.
- Use RED/GREEN in small vertical steps.
- UI should be calm, light, product-like, and avoid a marketing landing page.
- Test existing request display, loading/empty/error states, and create + refresh behavior.
- Keep infrastructure isolated behind an app-level service/composition layer.
- Tests must use fakes/stubs and never call the network.
- Google sign-in may appear only as a visible entry point; real auth remains out of scope.
- Run `npm test`, `npm run coverage`, `npm run typecheck`, and a dispatcher build.
- Require 100% statements, branches, functions, and lines for owned source before committing.

Verification results will be added after the slice is implemented.

Delivery:

- Added a Vue 3 + Vite dispatcher workspace under `apps/dispatcher`.
- Added a calm dispatcher dashboard with restrained gray surfaces, blue/green accents, clear `available` status indicators, loading/empty/error states, a Google sign-in affordance, and a relocation request form.
- Kept UI infrastructure isolated behind `DispatcherRelocationService`; the dashboard talks to that app-level service rather than directly to repositories or domain internals.
- Added `createDispatcherRelocationService`, which adapts the Vue app to the existing core `createRelocationRequest` and `listRelocationRequests` application boundary.
- Added a local Vite composition root using an in-memory repository and seeded demo data; no real Supabase credentials or secrets are required.
- RED/GREEN notes: first dashboard test failed on the missing component, then passed after rendering existing requests. State tests failed on the missing empty state, then passed after adding the empty branch. Create-flow test failed on missing form fields, then passed after adding the submit path.
- Coverage correction: added a focused non-`Error` rejection test for the load fallback branch, bringing dispatcher branch coverage from 96.87% to 100%.
- Build/tooling correction: pinned TypeScript to `5.9.3` because `vue-tsc` is not compatible with the installed TypeScript 7 package export layout in this environment.
- Verification: `npm test` passed with dispatcher 2 test files / 6 tests and core 2 test files / 7 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(37/37)`, 100% branches `(32/32)`, 100% functions `(12/12)`, 100% lines `(36/36)`. Core coverage: 100% statements `(25/25)`, 100% branches `(10/10)`, 100% functions `(11/11)`, 100% lines `(25/25)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run dispatcher:build` passed; Vite built `dist/index.html`, CSS, and JS assets successfully.

## 2026-07-08 - Slice 4

Prompt: implement only the dispatcher Supabase auth and persistence foundation for "The dispatcher web app uses the real Supabase browser client for Google OAuth and authenticated relocation persistence, while tests still use fakes/stubs and never call the network."

Constraints:

- Record final verification only from commands run in this thread.
- Keep scope to the dispatcher app plus minimal shared/core changes.
- Do not build the driver app.
- Do not write real secrets or require real Supabase credentials in tests.
- Keep the existing app-level service boundary and avoid leaking Supabase SDK details through components.
- Add Supabase browser client dependency.
- Add auth boundary support for current session, auth subscription/unsubscription, Google OAuth sign-in, sign-out, and clear auth errors.
- Add dispatcher app shell tests for missing config, unauthenticated Google sign-in, authenticated relocation dashboard wiring, and sign-out.
- Move Google sign-in responsibility out of `RelocationDashboard`.
- Add a new migration for authenticated Data API grants without editing already-applied migrations.
- Run `npm test`, `npm run coverage`, `npm run typecheck`, and `npm run dispatcher:build` from the repo root before committing.
- Require 100% statements, branches, functions, and lines for owned source before committing.

Delivery:

- Added `@supabase/supabase-js` to the dispatcher app.
- Added `createDispatcherAuthService` as the dispatcher auth boundary over a minimal structural Supabase auth client. It supports current session reads, auth state subscriptions with cleanup, Google OAuth sign-in using provider `google` and the current app origin, and sign-out.
- Added `DispatcherApp.vue` as the shell around the relocation dashboard. It renders a clear missing-config state, unauthenticated Google sign-in, authenticated dashboard wiring, auth state updates, and sign-out.
- Removed the Slice 3 fake Google button from `RelocationDashboard`; auth now belongs to the shell.
- Added runtime composition helpers for Vite env config, Supabase browser client creation, and wiring `SupabaseRelocationRequestRepository` through `createDispatcherRelocationService` with `session.user.id` as the dispatcher id.
- Replaced the local in-memory dispatcher `main.ts` composition with the real Supabase browser-client composition path. If public Supabase env vars are missing, the shell renders the configuration state instead of a blank screen.
- Added a new migration, `20260708183500_grant_relocation_requests_to_authenticated.sql`, granting only `authenticated` access required for browser Data API use: `usage` on schema `public`, `usage` on type `public.relocation_request_status`, and `select`, `insert`, `update` on `public.relocation_requests`. No anonymous table grants were added, and the initial migration was not edited.
- `.env.example` already had the required public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` names, so no env variable names changed. Google OAuth secrets remain Supabase provider configuration only.
- Verification: `npm test` passed with dispatcher 5 test files / 28 tests and core 2 test files / 7 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(96/96)`, 100% branches `(80/80)`, 100% functions `(31/31)`, 100% lines `(94/94)`. Core coverage: 100% statements `(25/25)`, 100% branches `(10/10)`, 100% functions `(11/11)`, 100% lines `(25/25)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run dispatcher:build` passed; Vite built `dist/index.html`, CSS bundle, and JS bundle successfully.
- Closeout: the verification results above were confirmed by a final root-level rerun in this thread immediately before the Slice 4 commit.

## 2026-07-08 - Slice 5

Prompt: implement only the dispatcher edit workflow for "Dispatcher users can edit an existing relocation request, save changes, and see the refreshed list."

Constraints:

- Scope is core relocation context and dispatcher app only.
- Do not build the driver app.
- Do not add booking flow or status-transition workflow.
- Keep tests network-free.
- Preserve existing request status when editing origin, destination, scheduled date/time, and notes.
- Extend repository/application boundaries minimally.
- Keep the current database schema unless a migration is strictly required.
- Keep `RelocationDashboard` focused on relocation workflow and avoid broad UI restyling.
- Run `npm test`, `npm run coverage`, `npm run typecheck`, and `npm run dispatcher:build` from the repo root before committing.
- Require 100% statements, branches, functions, and lines for owned source before committing.

Delivery:

- Added `updateRelocationRequest` to the core relocation application boundary with clear repository error wrapping.
- Extended `RelocationRequestRepository` minimally with `update(request)`.
- Updated the in-memory repository to edit origin, destination, scheduled time, and notes while preserving the existing status.
- Added Supabase repository update support using snake_case payload columns, `.eq("id", request.id)` scoping, and a clear update failure error. No database schema migration was required because the existing table already contains the editable columns and Slice 4 grants already include `update`.
- Extended the dispatcher app-level relocation service with `updateRelocationRequest` and wired it through the real core application boundary.
- Added dispatcher edit mode in `RelocationDashboard`: each request has an edit action, the form is populated from the selected request, save updates and refreshes the list, cancel returns to create mode without saving, and update failures render a clear message.
- Coverage correction: added focused tests for reachable fallback branches in dashboard save errors, core update error wrapping, missing in-memory update targets, and Supabase update default status.
- Typecheck correction: updated Slice 5 test fakes for the new update contract and kept the Supabase browser client behind the existing structural boundary to avoid deep SDK type instantiation.
- Verification: `npm test` passed with dispatcher 5 test files / 34 tests and core 2 test files / 14 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(115/115)`, 100% branches `(86/86)`, 100% functions `(37/37)`, 100% lines `(113/113)`. Core coverage: 100% statements `(40/40)`, 100% branches `(18/18)`, 100% functions `(15/15)`, 100% lines `(40/40)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run dispatcher:build` passed; Vite built `dist/index.html`, `dist/assets/index-6o2Ws50y.css`, and `dist/assets/index-DJnw6MLz.js` successfully.

## 2026-07-08 - Slice 6

Prompt: implement only "a driver can open the driver app and see available relocation gigs sorted by scheduled time."

Constraints:

- Scope is core relocation context and the driver app.
- Treat `available` as the current unbooked state; do not add booking, driver ownership, status transitions, or Google OAuth.
- Use fake/in-memory data for the driver UI to avoid expanding Supabase scope.
- Work RED/GREEN one behavior at a time.
- Keep tests network-free except Docker image/package retrieval needed to run Flutter tooling.
- Keep existing TypeScript coverage at 100%.
- Use Docker for Flutter verification because `flutter` is not available on PATH in this environment.

Delivery:

- Added `listDriverAvailableRelocationGigs` to the core relocation application boundary.
- Kept the existing domain status model unchanged and treated `available` as the unbooked state.
- Verified the driver query returns available gigs sorted by `scheduledAt` ascending.
- Added a minimal Flutter web driver app under `apps/driver` with `DriverGig`, `DriverGigService`, and `InMemoryDriverGigService`.
- Added a driver UI that renders available gigs through the app-level service boundary with fake in-memory data.
- Added Flutter model/widget tests for the in-memory service and the rendered gig ordering.
- Added root scripts for repeatable Docker verification: `npm run driver:test` and `npm run driver:build`.
- Verification: `npm test` passed with dispatcher 5 test files / 34 tests and core 2 test files / 15 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(115/115)`, 100% branches `(86/86)`, 100% functions `(37/37)`, 100% lines `(113/113)`. Core coverage: 100% statements `(44/44)`, 100% branches `(18/18)`, 100% functions `(18/18)`, 100% lines `(44/44)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 2 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 7

Prompt: implement only "a driver taps one available gig, confirms it, and then sees it in their booked list."

Constraints:

- Scope is core relocation context and the driver Flutter app.
- Add real `booked` status and driver ownership in the smallest explicit model.
- Booking uses public `requestId` and `driverId` inputs.
- Booking succeeds only for currently `available` gigs.
- Booking fails clearly when the gig is missing or already booked.
- Keep booking atomic at the repository port boundary.
- Keep the driver app on in-memory data; do not add Supabase UI wiring, Google OAuth, realtime, completed/cancelled statuses, or dispatcher UI changes.
- Keep tests network-free except Docker image/package retrieval needed to run Flutter tooling.
- Keep TypeScript coverage at 100%.

Delivery:

- Added `booked` to the relocation status model and added optional `driverId` ownership to relocation requests.
- Added `bookRelocationGig` as the public core booking use case and `listDriverBookedRelocationGigs` for booked-list display.
- Extended `RelocationRequestRepository` with atomic `bookAvailable(requestId, driverId)`.
- Updated the in-memory repository to book only currently available gigs and fail clearly for missing or unavailable requests.
- Updated `SupabaseRelocationRequestRepository` to map `driver_id`, support `booked` rows, and atomically book with update filters for both `id` and `status = available`.
- Added migrations `20260708192000_add_driver_booking_to_relocation_requests.sql` and `20260708192100_add_driver_booking_policy.sql` to add `booked`, nullable `driver_id`, and an authenticated driver booking policy. The policy is split into a later migration so the new enum value is committed before it is referenced.
- Extended the Flutter driver service and UI with available/booked sections and a one-tap `Book` action that refreshes both lists.
- Added Flutter model/widget tests for booking and booked-list behavior.
- Verification: `npm test` passed with dispatcher 5 test files / 34 tests and core 2 test files / 22 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(115/115)`, 100% branches `(86/86)`, 100% functions `(37/37)`, 100% lines `(113/113)`. Core coverage: 100% statements `(60/60)`, 100% branches `(32/32)`, 100% functions `(24/24)`, 100% lines `(60/60)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 4 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 8

Prompt: wire the driver Flutter app to real Supabase auth and data so a signed-in driver can list available gigs, book one, and see booked gigs.

Constraints:

- Keep in-memory driver services for tests and local fallback.
- Use Flutter `--dart-define` runtime configuration and do not commit secrets.
- Add Supabase Flutter initialization, auth, and data adapters behind app-level boundaries.
- Keep tests network-free with fake auth/gig services.
- Do not change dispatcher UI, add realtime, or add completed/cancelled statuses.
- Keep TypeScript coverage at 100%.

Delivery:

- Added `supabase_flutter` to the driver app and updated `pubspec.lock`.
- Added `DriverRuntimeConfig.fromEnvironment()` using the required dart-defines: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_OAUTH_REDIRECT_URL`.
- Added Supabase initialization only when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are present; otherwise the driver app keeps the in-memory local fallback.
- Added `DriverAuthService` and `DriverSession` boundaries with `SupabaseDriverAuthService` for current session, Google OAuth sign-in, and sign-out.
- Added `SupabaseDriverGigService` over `relocation_requests`: available gigs query filters `status = available`, booked gigs query filters `status = booked` and `driver_id = current driver id`, and booking uses an atomic update filtered by `id` and `status = available` while writing `status = booked` and `driver_id`.
- Added `DriverShell` to show a signed-out Google sign-in state and signed-in available/booked gigs state.
- Kept Flutter tests network-free with fake auth/gig services and added coverage for signed-out, signed-in, sign-out, booking refresh, and error behavior.
- Updated `.env.example` with the driver `--dart-define` variable names and ignored generated `.flutter-plugins-dependencies`.
- Verification: `npm test` passed with dispatcher 5 test files / 34 tests and core 2 test files / 21 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(115/115)`, 100% branches `(86/86)`, 100% functions `(37/37)`, 100% lines `(113/113)`. Core coverage: 100% statements `(60/60)`, 100% branches `(30/30)`, 100% functions `(24/24)`, 100% lines `(60/60)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 9 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 9

Prompt: refresh dispatcher and driver relocation lists when `relocation_requests` changes in Supabase realtime.

Constraints:

- Add app-level realtime boundaries for relocation request changes.
- Dispatcher subscribes to `public.relocation_requests`, refreshes after insert/update/delete events, and cleans up on unmount.
- Driver subscribes when signed in, refreshes available/booked lists after changes, and cleans up on dispose/sign-out.
- Keep tests network-free with fake realtime services/clients.
- Do not add statuses, redesign UI, add deployment work, or commit secrets.
- Keep TypeScript coverage at 100%.

Delivery:

- Added `DispatcherRealtimeService` and `createDispatcherRealtimeService` using Supabase realtime `postgres_changes` on `public.relocation_requests`.
- Wired dispatcher runtime to expose the realtime service and `RelocationDashboard` to refresh its list on realtime changes and unsubscribe on unmount.
- Added dispatcher tests proving refresh-on-change and cleanup with fakes, plus runtime tests proving subscribe/emit/unsubscribe wiring against a fake Supabase client.
- Added `DriverRealtimeService` and `SupabaseDriverRealtimeService` using `onPostgresChanges` on `public.relocation_requests`.
- Wired `DriverApp` to refresh available/booked lists on realtime changes and unsubscribe in `dispose`; `DriverShell` passes a realtime service only for signed-in sessions.
- Added Flutter tests proving driver refresh-on-change, cleanup on widget dispose, and cleanup on sign-out.
- Verification: `npm test` passed with dispatcher 5 test files / 36 tests and core 2 test files / 21 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(124/124)`, 100% branches `(86/86)`, 100% functions `(43/43)`, 100% lines `(122/122)`. Core coverage: 100% statements `(60/60)`, 100% branches `(30/30)`, 100% functions `(24/24)`, 100% lines `(60/60)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 11 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-09 - Slice 16

Prompt: prepare the public delivery package for the live presentation.

Constraints:

- Keep this slice documentation-only.
- Do not change runtime behavior.
- Make the repository self-explanatory for reviewers.
- Cover all requested deliverables: live URLs, public repo, prompt log, walkthrough, reflection, and presentation questions.
- Keep secrets out of docs.

Delivery:

- Added a public `README.md` with live URLs, product flow, architecture, stack, local verification commands, environment notes, and links to delivery artifacts.
- Added `docs/walkthrough-script.md` with a 5-minute end-to-end presentation flow for dispatcher, driver, sync/backend, and engineering quality.
- Added `docs/reflection.md` covering what worked, what broke, where AI got in the way, what would improve with another hour, and what this says about software development.
- Added `docs/presentation-prep.md` with prepared answers for the expected presentation questions.
- Added `docs/submission-checklist.md` with final technical checks, recording flow, and a submission message template.
- Updated `docs/task-board.md` with Slice 16 delivery packaging tasks.

Verification:

- `npm test -w @flovi/core -- --run test/deployment-artifacts.test.ts` passed with 1 file and 5 tests.
- GitHub Actions verification passed for delivery packaging commit `dc877be` on run `28998831983`.
- Vercel production deploys were manually promoted from current static app builds for dispatcher and driver.
- Hosted smoke checks passed for HTTP 200 responses, Supabase project references in production bundles, Google sign-in text, and Supabase OAuth `302` redirects for both live URLs.
- Final status recorded in `docs/final-delivery-status.md`.

## 2026-07-08 - Slice 12

Prompt: harden lifecycle authorization so Supabase enforces the same relocation update rules as the apps, even when the Data API is called directly.

Constraints:

- Add a migration that enforces valid `relocation_requests` updates at the database boundary.
- Preserve dispatcher editable-field updates on own requests while keeping `status` and `driver_id` unchanged.
- Preserve dispatcher cancellation of own `available` or `booked` requests.
- Preserve driver booking of `available` requests for themselves.
- Preserve driver completion of their own `booked` requests.
- Reject direct updates that change `dispatcher_id`, improperly change `driver_id`, move terminal `completed` or `cancelled` requests, or perform lifecycle transitions outside the allowed actor/status rules.
- Keep app behavior unless a small adapter query change is required.
- Do not add UI redesign, deployment work, or real secrets.
- Add tests first around migration artifacts because local Supabase execution is not part of the repo verification flow.
- Keep TypeScript coverage at 100%.

Delivery:

- Added a focused migration artifact test proving that the hardening migration creates a database update guard function and trigger, checks `auth.uid()`, rejects `dispatcher_id` changes, treats `completed` and `cancelled` as terminal statuses, preserves `driver_id` during dispatcher edit/cancel paths, and encodes the allowed dispatcher cancel, driver book, and driver complete transitions.
- RED result: `npm test -w @flovi/core -- --run test/deployment-artifacts.test.ts` failed because `supabase/migrations/20260708212000_guard_relocation_request_lifecycle_updates.sql` did not exist.
- Added `20260708212000_guard_relocation_request_lifecycle_updates.sql`, which creates `public.guard_relocation_request_update()` and a `before update` trigger on `public.relocation_requests`.
- The guard allows dispatcher editable-field updates on own requests when `status` and `driver_id` are unchanged.
- The guard allows dispatcher cancellation of own `available` or `booked` requests while preserving driver ownership and editable fields.
- The guard allows driver booking only from `available` to `booked` with `driver_id = auth.uid()`.
- The guard allows driver completion only from `booked` to `completed` when the existing `driver_id = auth.uid()`.
- The guard rejects unauthenticated updates, `dispatcher_id`/`id`/`created_at` changes, terminal status reversals, invalid `driver_id` changes, and lifecycle transitions outside those actor/status rules.
- No app behavior or adapter query changes were required.
- Verification: `npm test` passed with dispatcher 5 test files / 43 tests and core 3 test files / 36 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(146/146)`, 100% branches `(101/101)`, 100% functions `(56/56)`, 100% lines `(143/143)`. Core coverage: 100% statements `(89/89)`, 100% branches `(52/52)`, 100% functions `(33/33)`, 100% lines `(89/89)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 13 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 13

Prompt: make the demo feel populated and let dispatcher/driver users choose relocations by place and time without geolocation.

Constraints:

- Add a reusable demo dataset with at least 28 relocation requests across Madrid, Barcelona, Valencia, Seville, Malaga, Marbella, Bilbao, San Sebastian, Zaragoza, Alicante, A Coruna, and Palma.
- Include available/open, booked, completed, and cancelled lifecycle statuses.
- Use the dataset in local/fallback mode for dispatcher and driver while keeping Supabase runtime unchanged, except for a seed script/documentation.
- Add a Supabase demo seed script that uses env vars only and contains no hardcoded personal user IDs.
- Dispatcher adds origin/destination autocomplete, text search, status filter, date window filter, and clearer assignment visibility.
- Driver adds origin/destination filters, date window filter, pickup-time sort, and a suggested-next section based on the latest booked/completed destination.
- Keep the UI compact, calm, accessible, mobile-safe, and within the current framework.
- No deployment work or real secrets.
- Keep TypeScript coverage at 100%.

Delivery:

- Added a canonical 28-request Spain demo dataset in core with requests across Madrid, Barcelona, Valencia, Seville, Malaga, Marbella, Bilbao, San Sebastian, Zaragoza, Alicante, A Coruna, and Palma.
- Included all lifecycle statuses in the dataset: available/open, booked, completed, and cancelled.
- Added exported core filtering helpers for text search, exact origin/destination filters, status filters, inclusive scheduled date windows, scheduled-time sorting, and sorted place options for autocomplete controls.
- Wired dispatcher local fallback mode to a demo in-memory runtime seeded from the shared core dataset when Supabase public env vars are missing. The explicit missing-configuration shell remains available when no runtime is injected.
- Added dispatcher controls for text search, origin/destination autocomplete, status filters, date window filtering, and assigned-driver visibility for booked/completed requests.
- Expanded the Flutter driver fallback data to the same 28 demo records and added origin/destination filters, inclusive date filters, scheduled-time sorting, and a suggested-next section based on the latest booked/completed destination.
- Added `scripts/seed-supabase-demo-data.mjs` plus root `npm run seed:demo`. The script reads the shared core dataset, uses env vars for Supabase URL/service key and demo auth user IDs, generates deterministic request UUIDs, and does not commit real secrets or personal user IDs.
- Updated `docs/deployment.md` with the demo seed command and required env vars.
- Verification: `npm test` passed with dispatcher 5 test files / 48 tests and core 4 test files / 41 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(179/179)`, 100% branches `(134/134)`, 100% functions `(72/72)`, 100% lines `(173/173)`. Core coverage: 100% statements `(105/105)`, 100% branches `(69/69)`, 100% functions `(44/44)`, 100% lines `(104/104)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 16 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 14

Prompt: make the repository ready to publish and easy to verify from GitHub before deployment.

Constraints:

- Add `.github/workflows/verify.yml` running on push and pull request.
- Use Node 22, `npm ci`, and the existing root verification commands.
- Keep CI simple and deterministic with no secrets, deployment, or Supabase access.
- Add a concise demo smoke checklist covering local fallback dispatcher/driver demo data, Supabase seed command/env vars, Google OAuth callback/redirect checks, and hosted dispatcher/driver URL checks.
- Add artifact tests first for workflow and checklist contents.
- No UI changes, deployment work, or real secrets.
- Keep TypeScript coverage at 100%.

Delivery:

- Added `.github/workflows/verify.yml` for GitHub Actions verification on `push` and `pull_request`.
- The workflow uses Node 22, `npm ci`, and the existing root commands: `npm test`, `npm run coverage`, `npm run typecheck`, `npm run driver:test`, and `npm run driver:build`.
- Added `docs/demo-smoke-checklist.md` with local fallback dispatcher/driver checks, Supabase demo seed command and env vars, Google OAuth callback/redirect checks, hosted dispatcher URL check, and hosted driver URL check.
- Added a focused deployment artifact test that proves the workflow and smoke checklist contain the required commands and checks.
- RED result: `npm test -w @flovi/core -- --run test/deployment-artifacts.test.ts` failed because `.github/workflows/verify.yml` did not exist.
- GREEN result: the focused deployment artifact test passed after adding the workflow and checklist.
- Verification: `npm test` passed with dispatcher 5 test files / 48 tests and core 4 test files / 42 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(179/179)`, 100% branches `(134/134)`, 100% functions `(72/72)`, 100% lines `(173/173)`. Core coverage: 100% statements `(105/105)`, 100% branches `(69/69)`, 100% functions `(44/44)`, 100% lines `(104/104)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 16 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 15

Prompt: make Dispatcher and Driver feel like cohesive, production-grade operations apps with standard Google sign-in buttons.

Constraints:

- Replace Google login buttons in Dispatcher and Driver with a standard Google-style pattern: multicolor G icon, `Sign in with Google`, neutral/white surface, subtle border/ring, 40-48px height, 14px medium text, correct spacing, and no blue/purple primary styling.
- Preserve existing Supabase OAuth behavior.
- Use Tailwind CSS for the dispatcher. Use shadcn-vue direction where practical through source-owned, customizable primitives/tokens; document if the CLI is not practical.
- Make the dispatcher denser and more operational with aligned toolbar, consistent controls, readable status badges, and predictable table/list layout.
- Mirror the same design tokens in Flutter `ThemeData` and widgets for the driver app.
- Make the driver feel like a mobile operations app with compact app bar, full-width shell, filters, status navigation, scrollable gig cards, and safe-area-aware actions.
- Use a calm light palette, neutral greys, restrained blue/teal accent, and green/amber/red/grey status palette.
- Avoid marketing hero, decorative gradients/blobs, `transition: all`, data semantics changes, secrets, and deployment work.
- Add focused UI tests for Google button semantics, dispatcher filter/status affordances, and driver mobile sections.
- Keep TypeScript coverage at 100%.

Delivery:

- Added Tailwind CSS to the dispatcher Vite app and a source-owned token stylesheet in `apps/dispatcher/src/styles.css`.
- Used local shadcn-style primitives/tokens instead of the shadcn-vue CLI because the slice only needed a small source-owned Button/Input/Badge/Card/Table-style pass, and generated component scaffolding would add broader structure than this repo currently needs.
- Replaced the dispatcher Google sign-in action with a standard neutral Google-style button: multicolor G icon, `Sign in with Google`, white surface, subtle ring/shadow, 44px height, and 14px medium text. Supabase OAuth behavior is unchanged.
- Made the dispatcher dashboard denser and more operational with an aligned header, compact request form, explicit status filter toolbar, readable lifecycle badges, tighter filters, and a predictable request list layout.
- Replaced the driver Google sign-in action with a standard neutral Google-style button and multicolor G icon while preserving the existing auth service call.
- Mirrored dispatcher design tokens in Flutter `ThemeData` and widgets: calm off-white background, neutral card surfaces, teal actions, compact app bar, status chips, and 8-12px radii.
- Corrected the driver layout after review: filters now keep `Origin`/`Destination` in one row and `From`/`To` in a second row when width allows; available gigs use the full container width with a responsive grid of 1 column on mobile, 3 columns on tablet, and 5 columns on desktop; each gig card stretches to fill its grid column.
- Added focused UI tests for dispatcher Google button semantics, dispatcher operational toolbar/status affordances, driver Google button semantics, driver section visibility, driver filter-row layout, and driver available-grid breakpoints/column behavior.
- No backend/data semantics, secrets, or deployment behavior changed.

Screenshots:

- [Dispatcher signed-in dashboard](docs/assets/ui-polish/dispatcher-dashboard-desktop.png)
- [Dispatcher signed-out Google login](docs/assets/ui-polish/dispatcher-login-mobile.png)
- [Driver signed-in available gigs mobile](docs/assets/ui-polish/driver-available-mobile.png)
- [Driver signed-in available gigs desktop grid](docs/assets/ui-polish/driver-available-tablet.png)
- [Driver booked/completed mobile state](docs/assets/ui-polish/driver-booked-completed-mobile.png)
- [Driver signed-out Google login](docs/assets/ui-polish/driver-login-mobile.png)

Verification:

- `npm test` passed with dispatcher 5 test files / 50 tests and core 4 test files / 42 tests.
- `npm run coverage` passed. Dispatcher coverage: 100% statements `(184/184)`, 100% branches `(137/137)`, 100% functions `(73/73)`, 100% lines `(178/178)`. Core coverage: 100% statements `(105/105)`, 100% branches `(69/69)`, 100% functions `(44/44)`, 100% lines `(104/104)`.
- `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 20 tests passed.
- `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 11

Prompt: make the relocation lifecycle clear after booking: Open, Booked, Completed, Cancelled.

Constraints:

- Extend the stored status model with `completed` and `cancelled`, while preserving `available` as the stored open state and labeling it `Open` in UI.
- Dispatcher shows status summary counts and filters for All, Open, Booked, Completed, and Cancelled.
- Dispatcher can cancel open/booked requests; no delete flow.
- Driver can complete booked gigs and sees them in a Completed list.
- Open/available lists exclude booked, completed, and cancelled gigs.
- Supabase adapter and migrations support new statuses and atomic transitions.
- Keep fallback data small with at least one example per status.
- Do not add deployment work, UI redesign, or real secrets.
- Keep tests at public app/application boundaries with fakes only at external boundaries.
- Keep TypeScript coverage at 100%.

Delivery:

- Extended the core relocation lifecycle status model with `completed` and `cancelled` while keeping stored `available` as the open state.
- Added core application use cases for dispatcher cancellation, driver completion, and driver completed-gig listing. Available/open queries continue to return only `available` requests, while booked and completed lists are scoped to the driver and sorted by scheduled time.
- Extended the repository port with atomic lifecycle transitions: `cancelOpenOrBooked(requestId)` and `completeBooked(requestId, driverId)`.
- Updated the in-memory repository and Supabase repository adapter for cancellation and completion. Generic dispatcher edit/update remains limited to editable fields and does not write status or driver ownership.
- Added Supabase migrations `20260708210000_add_lifecycle_statuses.sql` and `20260708210100_add_lifecycle_transition_policies.sql`. The enum value migration is separate from the policy migration so the new enum values are committed before policy checks reference them.
- Updated the dispatcher dashboard with status summary counts and filters for All, Open, Booked, Completed, and Cancelled. Stored `available` now displays as `Open`.
- Added dispatcher cancel actions for open/booked requests with refresh and clear error handling.
- Updated the driver Flutter app with a Completed list and Complete action for booked gigs. Available/open lists continue to exclude booked, completed, and cancelled gigs.
- Updated small fallback seed data with examples across open, booked, completed, and cancelled lifecycle states.
- Coverage correction: added focused tests for the new lifecycle failure paths and filtered-empty UI branch to keep owned TypeScript source at 100% statements, branches, functions, and lines.
- Verification: `npm test` passed with dispatcher 5 test files / 43 tests and core 3 test files / 35 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(146/146)`, 100% branches `(101/101)`, 100% functions `(56/56)`, 100% lines `(143/143)`. Core coverage: 100% statements `(89/89)`, 100% branches `(52/52)`, 100% functions `(33/33)`, 100% lines `(89/89)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 13 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.

## 2026-07-08 - Slice 10

Prompt: make Supabase realtime and static hosting deployment setup explicit for a real Supabase project and public dispatcher/driver builds.

Constraints:

- Add a Supabase migration enabling realtime delivery for `public.relocation_requests` where needed.
- Keep the migration idempotent where practical.
- Add repo-level deployment documentation covering local setup, Supabase migrations, Google OAuth callback URLs, dispatcher Vercel env vars, driver Flutter web dart-defines, and build commands.
- Add Vercel config only if needed for the dispatcher or driver static build.
- Do not change UI, commit secrets, run external CLI logins, or execute deployment.
- Add a small automated deployment artifact check if a suitable pattern exists, without brittle text snapshots.
- Keep TypeScript coverage at 100%.

Delivery:

- Added `20260708203000_enable_relocation_requests_realtime.sql`, which sets `replica identity full` on `public.relocation_requests` and idempotently adds the table to the `supabase_realtime` publication by checking `pg_publication_tables` first.
- Added `docs/deployment.md` with local setup, Supabase migration commands, Google OAuth callback URL guidance, Supabase redirect URL guidance, dispatcher Vercel environment variables and build settings, driver Flutter web `--dart-define` values, static build output, and secrets handling.
- Confirmed no repo-level `vercel.json` is required for the dispatcher when Vercel project settings use `apps/dispatcher` as the root, `npm run build` as the build command, and `dist` as the output directory. The driver remains documented as a Flutter static web build that requires Flutter in the build environment or prebuilt static upload.
- Added a focused deployment artifact test in the core workspace that verifies required deployment config names and realtime migration primitives without snapshotting full docs.
- RED result: `npm test` failed because `docs/deployment.md` and `supabase/migrations/20260708203000_enable_relocation_requests_realtime.sql` did not exist yet.
- GREEN result: the deployment guide and realtime migration were added, and `npm test` passed.
- Verification: `npm test` passed with dispatcher 5 test files / 36 tests and core 3 test files / 23 tests.
- Verification: `npm run coverage` passed. Dispatcher coverage: 100% statements `(124/124)`, 100% branches `(86/86)`, 100% functions `(43/43)`, 100% lines `(122/122)`. Core coverage: 100% statements `(60/60)`, 100% branches `(30/30)`, 100% functions `(24/24)`, 100% lines `(60/60)`.
- Verification: `npm run typecheck` passed for dispatcher `vue-tsc` and core `tsc`.
- Verification: `npm run driver:test` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter test'`; Flutter reported 11 tests passed.
- Verification: `npm run driver:build` passed using `docker run --rm -v "$PWD/apps/driver:/workspace" -w /workspace ghcr.io/cirruslabs/flutter:stable sh -lc 'flutter pub get && flutter build web'`; Flutter built `build/web`.
