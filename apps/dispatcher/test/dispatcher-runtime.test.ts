import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DispatcherSession } from "../src/auth/createDispatcherAuthService.js";
import { createDispatcherRuntime } from "../src/runtime/createDispatcherRuntime.js";
import { createSupabaseBrowserClient } from "../src/runtime/createSupabaseBrowserClient.js";
import { readDispatcherConfig } from "../src/runtime/readDispatcherConfig.js";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

class FakeSupabaseClient {
  readonly inserts: unknown[] = [];
  private realtimeCallback: (() => void) | undefined;
  private unsubscribeCalls = 0;

  readonly auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithOAuth: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined } }
    }),
    signOut: async () => ({ error: null })
  };

  from(table: string) {
    const updateFilter = {
      eq: () => updateFilter,
      select: () => ({
        single: async () => ({ data: null, error: null })
      })
    };

    return {
      insert: async (row: unknown) => {
        this.inserts.push({ table, row });
        return { error: null };
      },
      update: () => updateFilter,
      select: () => ({
        order: async () => ({ data: [], error: null })
      })
    };
  }

  channel() {
    const realtimeChannel = {
      on: (
        _type: string,
        _filter: unknown,
        callback: () => void
      ) => {
        this.realtimeCallback = callback;
        return realtimeChannel;
      },
      subscribe: () => realtimeChannel,
      unsubscribe: () => {
        this.unsubscribeCalls += 1;
      }
    };

    return realtimeChannel;
  }

  emitRelocationChange() {
    this.realtimeCallback?.();
  }

  realtimeUnsubscribeCount() {
    return this.unsubscribeCalls;
  }
}

describe("dispatcher runtime", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("creates a Supabase browser client from public config", () => {
    const client = { auth: {} };
    createClientMock.mockReturnValue(client);

    expect(
      createSupabaseBrowserClient({
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "public-anon-key"
      })
    ).toBe(client);
    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "public-anon-key"
    );
  });

  it("reads dispatcher Supabase config from Vite env", () => {
    expect(
      readDispatcherConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "public-anon-key"
      })
    ).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "public-anon-key"
    });
  });

  it("wires relocation persistence to Supabase using the session user id", async () => {
    const supabase = new FakeSupabaseClient();
    const runtime = createDispatcherRuntime(supabase, {
      generateId: () => "request-from-runtime"
    });
    const session: DispatcherSession = {
      user: {
        id: "dispatcher-99"
      }
    };

    const service = runtime.createRelocationService(session);
    await service.createRelocationRequest({
      origin: "Madrid Airport",
      destination: "Barcelona Sants",
      scheduledAt: "2026-07-09T09:30:00.000Z",
      notes: "Authenticated request"
    });

    expect(supabase.inserts).toEqual([
      {
        table: "relocation_requests",
        row: {
          id: "request-from-runtime",
          dispatcher_id: "dispatcher-99",
          origin: "Madrid Airport",
          destination: "Barcelona Sants",
          scheduled_at: "2026-07-09T09:30:00.000Z",
          notes: "Authenticated request",
          status: "available",
          driver_id: null
        }
      }
    ]);
  });

  it("wires relocation realtime changes to Supabase and unsubscribes cleanly", () => {
    const supabase = new FakeSupabaseClient();
    const runtime = createDispatcherRuntime(supabase);
    let changeCount = 0;

    const unsubscribe =
      runtime.realtimeService!.subscribeToRelocationRequestChanges(() => {
        changeCount += 1;
      });
    supabase.emitRelocationChange();
    unsubscribe();

    expect(changeCount).toBe(1);
    expect(supabase.realtimeUnsubscribeCount()).toBe(1);
  });
});
