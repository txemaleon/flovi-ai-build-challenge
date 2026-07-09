part of '../main.dart';

class SupabaseDriverRealtimeService implements DriverRealtimeService {
  SupabaseDriverRealtimeService(this._client);

  final SupabaseClient _client;

  @override
  VoidCallback subscribeToRelocationRequestChanges(VoidCallback onChange) {
    final channel = _client
        .channel('driver-relocation-requests')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'relocation_requests',
          callback: (_) => onChange(),
        )
        .subscribe((status, error) {
      if (status == RealtimeSubscribeStatus.subscribed) {
        onChange();
      }
    });

    return () {
      unawaited(channel.unsubscribe());
    };
  }
}
