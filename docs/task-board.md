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

## Later Slices

- [ ] Dispatcher edits and updates relocation requests
- [ ] Driver browses available unbooked gigs
- [ ] Driver books a gig with one-tap confirmation
- [ ] Driver views booked gigs
- [ ] Supabase auth and realtime integration
- [ ] Dispatcher Vue app workflow
- [ ] Driver Flutter app workflow
- [ ] Deployment and public demo URLs
