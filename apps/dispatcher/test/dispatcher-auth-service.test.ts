import { describe, expect, it } from "vitest";
import {
  createDispatcherAuthService,
  type DispatcherSession
} from "../src/auth/createDispatcherAuthService.js";

type OAuthCall = Readonly<{
  provider: string;
  options: Readonly<{ redirectTo: string }>;
}>;

function createAuthClient(
  options: Readonly<{
    session?: DispatcherSession | null;
    getSessionError?: { message: string } | null;
    signInError?: { message: string } | null;
    signOutError?: { message: string } | null;
  }> = {}
) {
  const oauthCalls: OAuthCall[] = [];
  let authChangeCallback:
    | ((event: string, session: DispatcherSession | null) => void)
    | undefined;
  let unsubscribeCount = 0;

  return {
    oauthCalls,
    emitAuthChange: (session: DispatcherSession | null) => {
      authChangeCallback?.("SIGNED_IN", session);
    },
    get unsubscribeCount() {
      return unsubscribeCount;
    },
    client: {
      auth: {
        getSession: async () => ({
          data: { session: options.session ?? null },
          error: options.getSessionError ?? null
        }),
        signInWithOAuth: async (call: OAuthCall) => {
          oauthCalls.push(call);
          return { error: options.signInError ?? null };
        },
        onAuthStateChange: (
          callback: (event: string, session: DispatcherSession | null) => void
        ) => {
          authChangeCallback = callback;

          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  unsubscribeCount += 1;
                }
              }
            }
          };
        },
        signOut: async () => {
          return { error: options.signOutError ?? null };
        }
      }
    }
  };
}

describe("createDispatcherAuthService", () => {
  it("starts Google OAuth using the current app origin as redirect", async () => {
    const auth = createAuthClient();
    const service = createDispatcherAuthService(auth.client, {
      getCurrentOrigin: () => "https://dispatcher.flovi.test"
    });

    await service.signInWithGoogle();

    expect(auth.oauthCalls).toEqual([
      {
        provider: "google",
        options: {
          redirectTo: "https://dispatcher.flovi.test"
        }
      }
    ]);
  });

  it("uses the browser origin for Google OAuth redirects by default", async () => {
    const auth = createAuthClient();
    const service = createDispatcherAuthService(auth.client);

    await service.signInWithGoogle();

    expect(auth.oauthCalls[0]?.options.redirectTo).toBe(window.location.origin);
  });

  it("surfaces Google OAuth errors clearly", async () => {
    const auth = createAuthClient({
      signInError: { message: "OAuth provider is not configured" }
    });
    const service = createDispatcherAuthService(auth.client, {
      getCurrentOrigin: () => "https://dispatcher.flovi.test"
    });

    await expect(service.signInWithGoogle()).rejects.toThrow(
      "Failed to sign in with Google: OAuth provider is not configured"
    );
  });

  it("reads the current Supabase session", async () => {
    const session: DispatcherSession = {
      user: {
        id: "dispatcher-1",
        email: "dispatcher@example.com"
      }
    };
    const service = createDispatcherAuthService(
      createAuthClient({ session }).client
    );

    await expect(service.getCurrentSession()).resolves.toEqual(session);
  });

  it("surfaces current session errors clearly", async () => {
    const service = createDispatcherAuthService(
      createAuthClient({
        getSessionError: { message: "session storage unavailable" }
      }).client
    );

    await expect(service.getCurrentSession()).rejects.toThrow(
      "Failed to read Supabase session: session storage unavailable"
    );
  });

  it("subscribes to auth changes and unsubscribes cleanly", () => {
    const auth = createAuthClient();
    const service = createDispatcherAuthService(auth.client);
    const received: Array<DispatcherSession | null> = [];

    const unsubscribe = service.subscribeToAuthChanges((session) => {
      received.push(session);
    });

    auth.emitAuthChange({ user: { id: "dispatcher-2" } });
    unsubscribe();

    expect(received).toEqual([{ user: { id: "dispatcher-2" } }]);
    expect(auth.unsubscribeCount).toBe(1);
  });

  it("signs out through Supabase auth", async () => {
    const service = createDispatcherAuthService(createAuthClient().client);

    await expect(service.signOut()).resolves.toBeUndefined();
  });

  it("surfaces sign-out errors clearly", async () => {
    const service = createDispatcherAuthService(
      createAuthClient({
        signOutError: { message: "sign out failed" }
      }).client
    );

    await expect(service.signOut()).rejects.toThrow(
      "Failed to sign out: sign out failed"
    );
  });
});
