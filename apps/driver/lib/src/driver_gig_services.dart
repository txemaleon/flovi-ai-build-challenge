part of '../main.dart';

class InMemoryDriverGigService implements DriverGigService {
  InMemoryDriverGigService(this._gigs);

  final List<DriverGig> _gigs;

  @override
  Future<List<DriverGig>> listAvailableGigs() async {
    final available = _gigs.where((gig) => gig.status == 'available').toList()
      ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));

    return available;
  }

  @override
  Future<List<DriverGig>> listBookedGigs(String driverId) async {
    final booked = _gigs
        .where((gig) => gig.status == 'booked' && gig.driverId == driverId)
        .toList()
      ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));

    return booked;
  }

  @override
  Future<List<DriverGig>> listCompletedGigs(String driverId) async {
    final completed = _gigs
        .where((gig) => gig.status == 'completed' && gig.driverId == driverId)
        .toList()
      ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));

    return completed;
  }

  @override
  Future<DriverGig> bookGig({
    required String requestId,
    required String driverId,
  }) async {
    final index = _gigs.indexWhere((gig) => gig.id == requestId);

    if (index == -1) {
      throw StateError('Relocation gig not found.');
    }

    final gig = _gigs[index];

    if (gig.status != 'available') {
      throw StateError('Relocation gig is not available.');
    }

    final booked = gig.copyWith(status: 'booked', driverId: driverId);
    _gigs[index] = booked;

    return booked;
  }

  @override
  Future<DriverGig> completeGig({
    required String requestId,
    required String driverId,
  }) async {
    final index = _gigs.indexWhere((gig) => gig.id == requestId);

    if (index == -1) {
      throw StateError('Relocation gig not found.');
    }

    final gig = _gigs[index];

    if (gig.status != 'booked' || gig.driverId != driverId) {
      throw StateError('Relocation gig is not booked for this driver.');
    }

    final completed = gig.copyWith(status: 'completed');
    _gigs[index] = completed;

    return completed;
  }
}

class SupabaseDriverGigService implements DriverGigService {
  SupabaseDriverGigService(this._client);

  final SupabaseClient _client;

  @override
  Future<List<DriverGig>> listAvailableGigs() async {
    final rows = await _client
        .from('relocation_requests')
        .select(_columns)
        .eq('status', 'available')
        .order('scheduled_at');

    return _mapRows(rows);
  }

  @override
  Future<List<DriverGig>> listBookedGigs(String driverId) async {
    final rows = await _client
        .from('relocation_requests')
        .select(_columns)
        .eq('status', 'booked')
        .eq('driver_id', driverId)
        .order('scheduled_at');

    return _mapRows(rows);
  }

  @override
  Future<List<DriverGig>> listCompletedGigs(String driverId) async {
    final rows = await _client
        .from('relocation_requests')
        .select(_columns)
        .eq('status', 'completed')
        .eq('driver_id', driverId)
        .order('scheduled_at');

    return _mapRows(rows);
  }

  @override
  Future<DriverGig> bookGig({
    required String requestId,
    required String driverId,
  }) async {
    final row = await _client
        .from('relocation_requests')
        .update({
          'status': 'booked',
          'driver_id': driverId,
        })
        .eq('id', requestId)
        .eq('status', 'available')
        .select(_columns)
        .single();

    return _mapRow(row);
  }

  @override
  Future<DriverGig> completeGig({
    required String requestId,
    required String driverId,
  }) async {
    final row = await _client
        .from('relocation_requests')
        .update({'status': 'completed'})
        .eq('id', requestId)
        .eq('driver_id', driverId)
        .eq('status', 'booked')
        .select(_columns)
        .single();

    return _mapRow(row);
  }

  static const _columns =
      'id,origin,destination,scheduled_at,notes,status,driver_id';

  List<DriverGig> _mapRows(Object rows) {
    return (rows as List<Object?>)
        .map((row) => _mapRow(row as Map<String, dynamic>))
        .toList();
  }

  DriverGig _mapRow(Map<String, dynamic> row) {
    return DriverGig(
      id: row['id'] as String,
      origin: row['origin'] as String,
      destination: row['destination'] as String,
      scheduledAt: DateTime.parse(row['scheduled_at'] as String).toUtc(),
      notes: row['notes'] as String? ?? '',
      status: row['status'] as String,
      driverId: row['driver_id'] as String?,
    );
  }
}
