# Flovi Task Board

## Slice 1 - Dispatcher Creates And Lists Available Requests

- [x] Confirm Slice 1 scope and environment handling
- [x] Create minimal monorepo skeleton
- [x] RED: add failing application-boundary behavior test for create + list
- [x] GREEN: implement relocation domain/application code with repository port
- [x] Add in-memory repository adapter for tests
- [x] Add Supabase relocation request migration
- [x] Update `.env.example`
- [x] Run tests and coverage
- [x] Commit Slice 1

## Slice 2 - Supabase Repository Adapter For Create And List

- [x] Confirm Slice 2 scope: backend/core only, no Vue UI
- [x] RED: add failing adapter tests with fake Supabase client
- [x] GREEN: implement Supabase relocation request repository adapter
- [x] Verify insert maps domain fields to `relocation_requests` snake_case columns
- [x] Verify select rows map back to domain relocation requests
- [x] Verify insert/select failures surface clearly
- [x] Confirm migration compatibility
- [x] Run tests, coverage, and typecheck
- [x] Commit Slice 2

## Slice 3 - Dispatcher Vue Dashboard Create And List

- [x] Confirm Slice 3 scope: dispatcher app only, no driver app
- [x] Add Vue 3 + Vite dispatcher app skeleton
- [x] RED/GREEN: show existing relocation requests
- [x] RED/GREEN: show loading, empty, and error states
- [x] RED/GREEN: create a relocation request and refresh the visible list
- [x] Keep UI behind an app-level relocation service/composition layer
- [x] Add restrained product-like dashboard styling
- [x] Wire monorepo root scripts for dispatcher build/dev
- [x] Run tests, coverage, typecheck, and dispatcher build
- [x] Commit Slice 3

## Slice 4 - Dispatcher Supabase Auth And Persistence

- [x] Confirm Slice 4 scope: dispatcher app plus minimal core changes only
- [x] RED/GREEN: add dispatcher auth service tests and implementation
- [x] RED/GREEN: add dispatcher shell configuration state
- [x] RED/GREEN: show unauthenticated Google sign-in action
- [x] RED/GREEN: wire authenticated shell to Supabase relocation repository
- [x] RED/GREEN: expose authenticated sign-out action
- [x] Move Google sign-in responsibility out of relocation dashboard
- [x] Add Supabase browser client composition
- [x] Add authenticated Data API grant migration
- [x] Update `.env.example` if needed
- [x] Run tests, coverage, typecheck, and dispatcher build
- [x] Commit Slice 4

## Later Slices

- [ ] Dispatcher edits and updates relocation requests
- [ ] Driver browses available unbooked gigs
- [ ] Driver books a gig with one-tap confirmation
- [ ] Driver views booked gigs
- [ ] Supabase realtime integration
- [ ] Driver Flutter app workflow
- [ ] Deployment and public demo URLs
