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
