import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readRepoFile = (pathFromRepoRoot: string): string =>
  readFileSync(new URL(`../../../${pathFromRepoRoot}`, import.meta.url), "utf8");

describe("deployment artifacts", () => {
  it("documents the required public deployment configuration", () => {
    const guide = readRepoFile("docs/deployment.md");

    expect(guide).toContain("VITE_SUPABASE_URL");
    expect(guide).toContain("VITE_SUPABASE_ANON_KEY");
    expect(guide).toContain("SUPABASE_URL");
    expect(guide).toContain("SUPABASE_ANON_KEY");
    expect(guide).toContain("SUPABASE_OAUTH_REDIRECT_URL");
    expect(guide).toContain("/auth/v1/callback");
    expect(guide).toContain("npm run dispatcher:build");
    expect(guide).toContain("npm run driver:build");
  });

  it("enables Supabase realtime for relocation requests idempotently", () => {
    const migration = readRepoFile(
      "supabase/migrations/20260708203000_enable_relocation_requests_realtime.sql"
    );

    expect(migration).toContain("replica identity full");
    expect(migration).toContain("pg_publication_tables");
    expect(migration).toContain("supabase_realtime");
    expect(migration).toContain(
      "alter publication supabase_realtime add table public.relocation_requests"
    );
  });

  it("guards relocation request lifecycle updates at the database boundary", () => {
    const migration = readRepoFile(
      "supabase/migrations/20260708212000_guard_relocation_request_lifecycle_updates.sql"
    );

    expect(migration).toContain(
      "create or replace function public.guard_relocation_request_update()"
    );
    expect(migration).toContain("before update on public.relocation_requests");
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("new.dispatcher_id is distinct from old.dispatcher_id");
    expect(migration).toContain("old.status in ('completed', 'cancelled')");
    expect(migration).toContain("new.driver_id is not distinct from old.driver_id");
    expect(migration).toContain("old.status in ('available', 'booked')");
    expect(migration).toContain("new.status = 'cancelled'");
    expect(migration).toContain("old.status = 'available'");
    expect(migration).toContain("new.status = 'booked'");
    expect(migration).toContain("new.driver_id = actor_id");
    expect(migration).toContain("old.status = 'booked'");
    expect(migration).toContain("old.driver_id = actor_id");
    expect(migration).toContain("new.status = 'completed'");
    expect(migration).toContain("raise exception 'Invalid relocation request lifecycle update.'");
  });

  it("documents a Supabase demo seed script that uses env vars and the shared dataset", () => {
    const script = readRepoFile("scripts/seed-supabase-demo-data.mjs");
    const guide = readRepoFile("docs/deployment.md");

    expect(script).toContain("demo-relocation-requests.ts");
    expect(script).toContain("SUPABASE_URL");
    expect(script).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(script).toContain("DEMO_DISPATCHER_USER_ID");
    expect(script).toContain("DEMO_DRIVER_USER_ID");
    expect(script).toContain("DEMO_SECONDARY_DRIVER_USER_ID");
    expect(script).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    expect(guide).toContain("npm run seed:demo");
  });

  it("defines GitHub CI verification and a demo smoke checklist", () => {
    const workflow = readRepoFile(".github/workflows/verify.yml");
    const checklist = readRepoFile("docs/demo-smoke-checklist.md");

    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("push:");
    expect(workflow).toContain("node-version: 22");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm test");
    expect(workflow).toContain("npm run coverage");
    expect(workflow).toContain("npm run typecheck");
    expect(workflow).toContain("npm run driver:test");
    expect(workflow).toContain("npm run driver:build");

    expect(checklist).toContain("local fallback dispatcher");
    expect(checklist).toContain("local fallback driver");
    expect(checklist).toContain("npm run seed:demo");
    expect(checklist).toContain("SUPABASE_URL");
    expect(checklist).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(checklist).toContain("DEMO_DISPATCHER_USER_ID");
    expect(checklist).toContain("DEMO_DRIVER_USER_ID");
    expect(checklist).toContain("/auth/v1/callback");
    expect(checklist).toContain("hosted dispatcher URL");
    expect(checklist).toContain("hosted driver URL");
  });
});
