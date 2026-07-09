# Reflection

## What Worked

Breaking the work into narrow vertical slices worked well. The first slices established the relocation domain, repository ports, and Supabase adapter before adding UI. That made later changes safer because dispatcher and driver behavior could reuse the same application boundary instead of duplicating business rules.

TDD was useful for keeping the AI output honest. Each slice started with failing tests at a public boundary: domain/use-case tests for relocation behavior, Vue tests for dispatcher flows, Flutter widget tests for driver behavior, and artifact tests for migrations and CI files. Coverage gates caught missing branches several times before the work was considered complete.

Supabase was a good fit for the assignment because it handled Google OAuth, Postgres persistence, realtime updates, and row-level security without building a custom backend service.

## What Broke Or Was Incomplete

The first UI passes were too generic. They satisfied the functional requirements but felt like a tutorial app: too much default styling, over-rounded controls, weak hierarchy, and not enough operational density. That was caught through screenshot review and corrected with a more restrained light palette, Tailwind-backed dispatcher styling, and Flutter theme tokens.

The driver layout also needed correction after the first polish pass. Available gigs did not use the full width consistently on larger screens. The fix was to add responsive layout behavior and tests: one column on mobile, three columns on tablet, and five columns on desktop, with cards stretching inside their grid cells.

OAuth required real provider setup, not just a visible button. The demo now uses Supabase Google OAuth, with Google secrets stored in Supabase provider configuration rather than client-side environment variables.

Supabase authorization also needed more than client-side checks. RLS policies covered normal app behavior, but lifecycle transitions needed a database trigger guard so direct updates could not skip valid status rules.

## Where AI Got In The Way

The AI tended to produce large first passes when the safer path was a smaller slice. The fix was to keep prompts atomic and require the implementation to stop after each commit with changed files, verification results, and the next recommended slice.

It also sometimes treated UI polish as surface styling only. Screenshot review caught cases where spacing, widths, and responsive behavior were still off even though tests passed. The correction was to add visual verification and layout-focused widget tests.

Another issue was documentation drift. As the implementation evolved, task board and prompt log sections had to be updated slice by slice so the delivery artifacts stayed aligned with the code.

## What I Would Improve With Another Hour

1. Add deployed end-to-end smoke tests that sign in against Supabase in a controlled test environment.
2. Add automated screenshot regression checks for dispatcher and driver breakpoints.
3. Add a dispatcher route-map style view or distance estimate for relocation planning.
4. Add a clearer seeded demo reset workflow for presentations.
5. Add stronger observability for realtime events and Supabase failures in the hosted apps.

## What This Says About Software Development

AI makes it much faster to generate working code, but the scarce skill is still engineering judgment. The important work was decomposition, asking for testable slices, checking outputs, tightening requirements, and catching when the result was technically functional but not product-ready.

The workflow felt less like writing every line and more like directing a fast implementation team: define the slice, constrain the architecture, demand verification, inspect the result, and iterate.
