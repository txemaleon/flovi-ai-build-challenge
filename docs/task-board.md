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

## Slice 5 - Dispatcher Edits Existing Requests

- [x] Confirm Slice 5 scope: core relocation context and dispatcher app only
- [x] RED: add core application-boundary update tests
- [x] GREEN: update relocation request through core application boundary
- [x] GREEN: preserve existing request status while editing fields
- [x] GREEN: surface repository update errors clearly
- [x] RED/GREEN: update in-memory relocation repository adapter
- [x] RED: add Supabase update adapter tests with fake client
- [x] GREEN: update Supabase relocation repository adapter
- [x] RED/GREEN: open populated dispatcher edit form
- [x] RED/GREEN: save edits and refresh visible list
- [x] RED/GREEN: cancel edit mode without saving
- [x] RED/GREEN: show clear update failure message
- [x] Run tests, coverage, typecheck, and dispatcher build
- [x] Commit Slice 5

## Slice 6 - Driver Browses Available Gigs

- [x] Confirm Slice 6 scope: core relocation query and driver Flutter app only
- [x] RED: add core application-boundary test for driver-available gigs
- [x] GREEN: list available relocation gigs sorted by scheduled time
- [x] RED: add Flutter driver service/widget tests
- [x] GREEN: add minimal Flutter web driver app with app-level service boundary
- [x] Add Docker-backed driver test/build scripts
- [x] Run npm tests, coverage, typecheck, and Docker driver verification
- [x] Commit Slice 6

## Slice 7 - Driver Books One Available Gig

- [x] Confirm Slice 7 scope: core booking and driver Flutter app only
- [x] RED/GREEN: add `booked` status and driver ownership to the core model
- [x] RED/GREEN: book an available gig through the core application boundary
- [x] RED/GREEN: fail clearly when booking a missing gig
- [x] RED/GREEN: fail clearly when booking an already-booked gig
- [x] RED/GREEN: list booked gigs for a driver
- [x] RED/GREEN: implement atomic booking at the repository port boundary
- [x] RED/GREEN: extend Supabase adapter and migrations for booking
- [x] RED/GREEN: add Flutter available/booked sections and one-tap booking
- [x] Run npm tests, coverage, typecheck, and Docker driver verification
- [x] Commit Slice 7

## Slice 8 - Driver Supabase Auth And Data

- [x] Confirm Slice 8 scope: driver Flutter app runtime wiring only
- [x] Keep in-memory driver services for tests and local fallback
- [x] Add Flutter `--dart-define` runtime configuration
- [x] Add Supabase Flutter dependency and initialization
- [x] Add driver auth boundary for session, Google sign-in, and sign-out
- [x] Add Supabase driver gig service for available, booked, and booking flows
- [x] RED/GREEN: signed-out Google sign-in state
- [x] RED/GREEN: signed-in available/booked gigs state
- [x] RED/GREEN: booking refresh and error behavior with fakes
- [x] Update `.env.example` with driver build variables
- [x] Run npm tests, coverage, typecheck, and Docker driver verification
- [x] Commit Slice 8

## Later Slices

- [ ] Supabase realtime integration
- [ ] Deployment and public demo URLs
