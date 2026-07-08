import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { RelocationRequest } from "@flovi/core";
import DispatcherApp from "../src/DispatcherApp.vue";
import type {
  DispatcherAuthService,
  DispatcherSession
} from "../src/auth/createDispatcherAuthService.js";
import type { DispatcherRelocationService } from "../src/services/dispatcherRelocationService.js";

function createRelocationService(
  requests: RelocationRequest[]
): DispatcherRelocationService {
  return {
    listRelocationRequests: async () => requests,
    createRelocationRequest: async () => {
      throw new Error("create is not used in this test");
    },
    updateRelocationRequest: async () => {
      throw new Error("update is not used in this test");
    },
    cancelRelocationRequest: async () => {
      throw new Error("cancel is not used in this test");
    }
  };
}

function createAuthService(
  session: DispatcherSession | null,
  options: Readonly<{
    getCurrentSessionError?: unknown;
    signInError?: unknown;
    signOutError?: unknown;
  }> = {}
): {
  authService: DispatcherAuthService;
  signInCount: () => number;
  signOutCount: () => number;
  unsubscribeCount: () => number;
  emitAuthChange: (session: DispatcherSession | null) => void;
} {
  let signInCalls = 0;
  let signOutCalls = 0;
  let unsubscribeCalls = 0;
  let authChangeCallback:
    | ((session: DispatcherSession | null) => void)
    | undefined;

  return {
    signInCount: () => signInCalls,
    signOutCount: () => signOutCalls,
    unsubscribeCount: () => unsubscribeCalls,
    emitAuthChange: (nextSession) => {
      authChangeCallback?.(nextSession);
    },
    authService: {
      getCurrentSession: async () => {
        if (options.getCurrentSessionError) {
          throw options.getCurrentSessionError;
        }

        return session;
      },
      subscribeToAuthChanges: (callback) => {
        authChangeCallback = callback;

        return () => {
          unsubscribeCalls += 1;
        };
      },
      signInWithGoogle: async () => {
        signInCalls += 1;

        if (options.signInError) {
          throw options.signInError;
        }
      },
      signOut: async () => {
        signOutCalls += 1;

        if (options.signOutError) {
          throw options.signOutError;
        }
      }
    }
  };
}

describe("DispatcherApp", () => {
  it("shows a clear configuration state when Supabase env is missing", async () => {
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {}
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Supabase configuration is missing");
    expect(wrapper.text()).toContain("VITE_SUPABASE_URL");
    expect(wrapper.text()).toContain("VITE_SUPABASE_ANON_KEY");
  });

  it("shows a real Google sign-in action for unauthenticated users", async () => {
    const auth = createAuthService(null);
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();
    await wrapper.find('[data-test="google-sign-in"]').trigger("click");

    expect(wrapper.text()).toContain("Sign in with Google");
    expect(auth.signInCount()).toBe(1);
  });

  it("renders the Google sign-in action with standard button semantics", async () => {
    const auth = createAuthService(null);
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();

    const button = wrapper.find('[data-test="google-sign-in"]');
    expect(button.text()).toBe("Sign in with Google");
    expect(button.attributes("aria-label")).toBe("Sign in with Google");
    expect(button.classes()).toContain("google-sign-in-button");
    expect(button.classes()).not.toContain("primary-button");
    expect(button.find('[data-test="google-g-icon"]').exists()).toBe(true);
  });

  it("shows a fallback session error when config exists without a runtime", async () => {
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Unable to read auth session.");
  });

  it("wires authenticated users to the relocation dashboard with their session user id", async () => {
    const auth = createAuthService({
      user: {
        id: "dispatcher-42",
        email: "dispatcher@example.com"
      }
    });
    const seenDispatcherIds: string[] = [];
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: (session) => {
            seenDispatcherIds.push(session.user.id);
            return createRelocationService([
              {
                id: "request-42",
                dispatcherId: session.user.id,
                origin: "Madrid Airport",
                destination: "Barcelona Sants",
                scheduledAt: "2026-07-09T09:30:00.000Z",
                notes: "",
                status: "available"
              }
            ]);
          }
        }
      }
    });

    await flushPromises();

    expect(seenDispatcherIds).toEqual(["dispatcher-42"]);
    expect(wrapper.text()).toContain("dispatcher@example.com");
    expect(wrapper.text()).toContain("Madrid Airport");
    expect(wrapper.text()).toContain("Barcelona Sants");
  });

  it("lets authenticated users sign out and unsubscribes on unmount", async () => {
    const auth = createAuthService({ user: { id: "dispatcher-42" } });
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();
    await wrapper.find('[data-test="sign-out"]').trigger("click");
    wrapper.unmount();

    expect(auth.signOutCount()).toBe(1);
    expect(auth.unsubscribeCount()).toBe(1);
  });

  it("updates the shell when Supabase auth state changes", async () => {
    const auth = createAuthService(null);
    const seenDispatcherIds: string[] = [];
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: (session) => {
            seenDispatcherIds.push(session.user.id);
            return createRelocationService([]);
          }
        }
      }
    });

    await flushPromises();
    auth.emitAuthChange({ user: { id: "dispatcher-from-event" } });
    await flushPromises();

    expect(seenDispatcherIds).toEqual(["dispatcher-from-event"]);
    expect(wrapper.text()).toContain("dispatcher-from-event");
  });

  it("shows a fallback session error when auth startup rejects without an Error", async () => {
    const auth = createAuthService(null, {
      getCurrentSessionError: "session failed"
    });
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Unable to read auth session.");
  });

  it("shows Supabase session errors from auth startup", async () => {
    const auth = createAuthService(null, {
      getCurrentSessionError: new Error("Failed to read Supabase session")
    });
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Failed to read Supabase session");
  });

  it("shows a fallback sign-in error when Google sign-in rejects without an Error", async () => {
    const auth = createAuthService(null, {
      signInError: "sign-in failed"
    });
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();
    await wrapper.find('[data-test="google-sign-in"]').trigger("click");

    expect(wrapper.text()).toContain("Unable to start Google sign-in.");
  });

  it("shows Supabase Google sign-in errors", async () => {
    const auth = createAuthService(null, {
      signInError: new Error("Failed to sign in with Google")
    });
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();
    await wrapper.find('[data-test="google-sign-in"]').trigger("click");

    expect(wrapper.text()).toContain("Failed to sign in with Google");
  });

  it("shows a fallback sign-out error when sign-out rejects without an Error", async () => {
    const auth = createAuthService({ user: { id: "dispatcher-42" } }, {
      signOutError: "sign-out failed"
    });
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();
    await wrapper.find('[data-test="sign-out"]').trigger("click");

    expect(wrapper.text()).toContain("Unable to sign out.");
  });

  it("shows Supabase sign-out errors", async () => {
    const auth = createAuthService({ user: { id: "dispatcher-42" } }, {
      signOutError: new Error("Failed to sign out")
    });
    const wrapper = mount(DispatcherApp, {
      props: {
        config: {
          supabaseUrl: "https://example.supabase.co",
          supabaseAnonKey: "public-anon-key"
        },
        runtime: {
          authService: auth.authService,
          createRelocationService: () => createRelocationService([])
        }
      }
    });

    await flushPromises();
    await wrapper.find('[data-test="sign-out"]').trigger("click");

    expect(wrapper.text()).toContain("Failed to sign out");
  });
});
