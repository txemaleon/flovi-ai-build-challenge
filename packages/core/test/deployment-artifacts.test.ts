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
});
