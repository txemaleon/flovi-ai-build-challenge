type SupabaseAuthError = Readonly<{
  message: string;
}>;

type SupabaseAuthResult = Readonly<{
  error: SupabaseAuthError | null;
}>;

type SupabaseOAuthOptions = Readonly<{
  provider: "google";
  options: Readonly<{
    redirectTo: string;
  }>;
}>;

export type DispatcherSession = Readonly<{
  user: Readonly<{
    id: string;
    email?: string;
  }>;
}>;

export type DispatcherAuthClient = Readonly<{
  auth: Readonly<{
    getSession(): PromiseLike<
      Readonly<{
        data: Readonly<{ session: DispatcherSession | null }>;
        error: SupabaseAuthError | null;
      }>
    >;
    signInWithOAuth(options: SupabaseOAuthOptions): PromiseLike<SupabaseAuthResult>;
    onAuthStateChange(
      callback: (event: string, session: DispatcherSession | null) => void
    ): Readonly<{
      data: Readonly<{
        subscription: Readonly<{
          unsubscribe(): void;
        }>;
      }>;
    }>;
    signOut(): PromiseLike<SupabaseAuthResult>;
  }>;
}>;

export type DispatcherAuthServiceOptions = Readonly<{
  getCurrentOrigin?: () => string;
}>;

export type DispatcherAuthService = Readonly<{
  getCurrentSession(): Promise<DispatcherSession | null>;
  subscribeToAuthChanges(
    callback: (session: DispatcherSession | null) => void
  ): () => void;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
}>;

export function createDispatcherAuthService(
  client: DispatcherAuthClient,
  options: DispatcherAuthServiceOptions = {}
): DispatcherAuthService {
  return {
    getCurrentSession: async () => {
      const result = await client.auth.getSession();

      if (result.error) {
        throw new Error(
          `Failed to read Supabase session: ${result.error.message}`
        );
      }

      return result.data.session;
    },
    subscribeToAuthChanges: (callback) => {
      const result = client.auth.onAuthStateChange((_event, session) => {
        callback(session);
      });

      return () => {
        result.data.subscription.unsubscribe();
      };
    },
    signInWithGoogle: async () => {
      const result = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getCurrentOrigin(options)
        }
      });

      if (result.error) {
        throw new Error(`Failed to sign in with Google: ${result.error.message}`);
      }
    },
    signOut: async () => {
      const result = await client.auth.signOut();

      if (result.error) {
        throw new Error(`Failed to sign out: ${result.error.message}`);
      }
    }
  };
}

function getCurrentOrigin(options: DispatcherAuthServiceOptions): string {
  return options.getCurrentOrigin?.() ?? window.location.origin;
}
