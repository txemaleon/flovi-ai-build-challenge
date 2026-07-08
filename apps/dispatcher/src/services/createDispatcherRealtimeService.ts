import type { DispatcherRealtimeService } from "./dispatcherRealtimeService.js";

export type DispatcherRealtimeClient = Readonly<{
  channel(name: string): DispatcherRealtimeChannel;
}>;

type DispatcherRealtimeChannel = {
  on(
    type: "postgres_changes",
    filter: {
      event: "*";
      schema: "public";
      table: "relocation_requests";
    },
    callback: () => void
  ): DispatcherRealtimeChannel;
  subscribe(): DispatcherRealtimeChannel;
  unsubscribe(): unknown;
};

export function createDispatcherRealtimeService(
  client: DispatcherRealtimeClient
): DispatcherRealtimeService {
  return {
    subscribeToRelocationRequestChanges: (onChange) => {
      const channel = client
        .channel("dispatcher-relocation-requests")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "relocation_requests"
          },
          onChange
        )
        .subscribe();

      return () => {
        void channel.unsubscribe();
      };
    }
  };
}
