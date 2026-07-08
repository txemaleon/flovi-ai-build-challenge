export type DispatcherRealtimeService = Readonly<{
  subscribeToRelocationRequestChanges(onChange: () => void): () => void;
}>;
