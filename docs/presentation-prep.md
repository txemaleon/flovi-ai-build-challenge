# Presentation Prep

## How Did You Break The Problem Down?

I split the work into vertical slices:

1. Core relocation domain and use cases.
2. Supabase persistence adapter.
3. Dispatcher create/list UI.
4. Dispatcher Google OAuth and authenticated persistence.
5. Dispatcher edit workflow.
6. Driver available gigs.
7. Driver booking and booked list.
8. Driver Supabase auth and data.
9. Realtime refresh.
10. Supabase realtime/deployment docs.
11. Lifecycle statuses.
12. Database-level lifecycle authorization.
13. Demo data and filtering.
14. CI and smoke checklist.
15. UI polish and standard Google sign-in.
16. Delivery packaging.

That kept each prompt small enough to verify and commit independently.

## What Was The Prompting Strategy?

The prompts were deliberately structured:

- one goal per slice,
- explicit scope,
- explicit non-goals,
- TDD expectations,
- required verification commands,
- required documentation updates,
- conventional commit at the end.

The main pattern was red-green-refactor with a stop point after every slice. I asked for final reports with commit hash, changed files, verification, and remaining risk.

## Where Did AI Produce Something Wrong Or Incomplete?

- The early UI was functional but too basic. Screenshot review caught the gap.
- The driver grid did not use full width on larger screens. A layout-specific correction added 1/3/5-column behavior.
- OAuth initially risked being treated as a visual affordance. The final version uses real Supabase Google OAuth.
- Client-side lifecycle checks were not enough. A Supabase trigger guard was added to enforce valid transitions at the database boundary.
- Flutter Web is harder to inspect with normal DOM tooling, so widget tests and screenshots became more important.

## How Did You Catch It?

- Automated tests and coverage gates caught missing branches and behavior regressions.
- Migration artifact tests caught missing database/security artifacts.
- Manual and automated screenshot review caught layout and visual quality issues.
- Hosted smoke checks caught production OAuth/configuration issues.
- The task board and prompt log made it visible when a requirement was only partially done.

## What Would You Improve First With Another Hour?

First priority: add a deployed end-to-end smoke test suite for the production Supabase-backed demo. That would verify login redirects, seeded data, booking, completion, and realtime refresh against the hosted URLs.

Second priority: automate screenshot regression checks for the key breakpoints used in the presentation.

## What Does This Experience Say About Software Development Changing?

The bottleneck is moving from typing code to steering systems. AI can generate implementation quickly, but it needs precise decomposition, strong constraints, tests, and product judgment. The engineer's role becomes closer to architecture, QA, reviewer, and product owner combined.
