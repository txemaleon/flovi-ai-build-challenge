import 'dart:async';

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final config = DriverRuntimeConfig.fromEnvironment();

  if (config.hasSupabaseConfig) {
    await Supabase.initialize(
      url: config.supabaseUrl,
      anonKey: config.supabaseAnonKey,
    );
  }

  runApp(
    MaterialApp(
      title: 'Flovi Driver',
      home: DriverShell(
        authService: config.hasSupabaseConfig
            ? SupabaseDriverAuthService(
                Supabase.instance.client,
                redirectTo: config.oauthRedirectUrl,
              )
            : InMemoryDriverAuthService(
                const DriverSession(userId: 'demo-driver'),
              ),
        createGigService: (_) => config.hasSupabaseConfig
            ? SupabaseDriverGigService(Supabase.instance.client)
            : InMemoryDriverGigService(seedDriverGigs()),
        createRealtimeService: (_) => config.hasSupabaseConfig
            ? SupabaseDriverRealtimeService(Supabase.instance.client)
            : null,
      ),
    ),
  );
}

class DriverRuntimeConfig {
  const DriverRuntimeConfig({
    required this.supabaseUrl,
    required this.supabaseAnonKey,
    required this.oauthRedirectUrl,
  });

  factory DriverRuntimeConfig.fromEnvironment() {
    return const DriverRuntimeConfig(
      supabaseUrl: String.fromEnvironment('SUPABASE_URL'),
      supabaseAnonKey: String.fromEnvironment('SUPABASE_ANON_KEY'),
      oauthRedirectUrl: String.fromEnvironment('SUPABASE_OAUTH_REDIRECT_URL'),
    );
  }

  final String supabaseUrl;
  final String supabaseAnonKey;
  final String oauthRedirectUrl;

  bool get hasSupabaseConfig =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}

List<DriverGig> seedDriverGigs() {
  return [
    DriverGig(
      id: 'gig-1',
      origin: 'Madrid Chamartin',
      destination: 'Seville Station',
      scheduledAt: DateTime.utc(2026, 7, 10, 9, 30),
      notes: 'Pickup at the north entrance.',
      status: 'available',
    ),
    DriverGig(
      id: 'gig-2',
      origin: 'Barcelona Sants',
      destination: 'Valencia Port',
      scheduledAt: DateTime.utc(2026, 7, 12, 15),
      notes: 'Bring parking ticket.',
      status: 'booked',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'gig-3',
      origin: 'Seville Station',
      destination: 'Malaga Airport',
      scheduledAt: DateTime.utc(2026, 7, 13, 11),
      notes: 'Completed demo relocation.',
      status: 'completed',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'gig-4',
      origin: 'Bilbao Depot',
      destination: 'San Sebastian',
      scheduledAt: DateTime.utc(2026, 7, 14, 8, 15),
      notes: 'Cancelled dispatcher request.',
      status: 'cancelled',
    ),
    DriverGig(
      id: 'gig-5',
      origin: 'Valencia Port',
      destination: 'Madrid Chamartin',
      scheduledAt: DateTime.utc(2026, 7, 15, 10),
      notes: 'Open relocation request.',
      status: 'available',
    ),
  ];
}

class DriverGig {
  const DriverGig({
    required this.id,
    required this.origin,
    required this.destination,
    required this.scheduledAt,
    required this.notes,
    required this.status,
    this.driverId,
  });

  final String id;
  final String origin;
  final String destination;
  final DateTime scheduledAt;
  final String notes;
  final String status;
  final String? driverId;

  DriverGig copyWith({String? status, String? driverId}) {
    return DriverGig(
      id: id,
      origin: origin,
      destination: destination,
      scheduledAt: scheduledAt,
      notes: notes,
      status: status ?? this.status,
      driverId: driverId ?? this.driverId,
    );
  }
}

class DriverSession {
  const DriverSession({required this.userId, this.email});

  final String userId;
  final String? email;
}

abstract interface class DriverAuthService {
  Future<DriverSession?> currentSession();
  Future<void> signInWithGoogle();
  Future<void> signOut();
}

abstract interface class DriverGigService {
  Future<List<DriverGig>> listAvailableGigs();
  Future<List<DriverGig>> listBookedGigs(String driverId);
  Future<List<DriverGig>> listCompletedGigs(String driverId);
  Future<DriverGig> bookGig({
    required String requestId,
    required String driverId,
  });
  Future<DriverGig> completeGig({
    required String requestId,
    required String driverId,
  });
}

abstract interface class DriverRealtimeService {
  VoidCallback subscribeToRelocationRequestChanges(VoidCallback onChange);
}

typedef DriverGigServiceFactory = DriverGigService Function(
  DriverSession session,
);

typedef DriverRealtimeServiceFactory = DriverRealtimeService? Function(
  DriverSession session,
);

class DriverShell extends StatefulWidget {
  const DriverShell({
    required this.authService,
    required this.createGigService,
    this.createRealtimeService,
    super.key,
  });

  final DriverAuthService authService;
  final DriverGigServiceFactory createGigService;
  final DriverRealtimeServiceFactory? createRealtimeService;

  @override
  State<DriverShell> createState() => _DriverShellState();
}

class _DriverShellState extends State<DriverShell> {
  late Future<DriverSession?> _session;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _session = widget.authService.currentSession();
  }

  Future<void> _signInWithGoogle() async {
    setState(() {
      _errorMessage = null;
    });

    try {
      await widget.authService.signInWithGoogle();
      setState(() {
        _session = widget.authService.currentSession();
      });
    } catch (error) {
      setState(() {
        _errorMessage = error is Error
            ? error.toString().replaceFirst('Bad state: ', '')
            : 'Unable to sign in.';
      });
    }
  }

  Future<void> _signOut() async {
    await widget.authService.signOut();
    setState(() {
      _session = widget.authService.currentSession();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<DriverSession?>(
      future: _session,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final session = snapshot.data;

        if (session == null) {
          return Scaffold(
            backgroundColor: const Color(0xfff6f7f9),
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Driver sign-in',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _signInWithGoogle,
                      child: const Text('Sign in with Google'),
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Text(_errorMessage!),
                    ],
                  ],
                ),
              ),
            ),
          );
        }

        return Stack(
          children: [
            DriverApp(
              driverId: session.userId,
              realtimeService: widget.createRealtimeService?.call(session),
              service: widget.createGigService(session),
            ),
            Positioned(
              top: 8,
              right: 8,
              child: SafeArea(
                child: TextButton(
                  onPressed: _signOut,
                  child: const Text('Sign out'),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

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

class InMemoryDriverAuthService implements DriverAuthService {
  InMemoryDriverAuthService(this._session);

  DriverSession? _session;

  @override
  Future<DriverSession?> currentSession() async => _session;

  @override
  Future<void> signInWithGoogle() async {
    _session ??= const DriverSession(userId: 'demo-driver');
  }

  @override
  Future<void> signOut() async {
    _session = null;
  }
}

class SupabaseDriverAuthService implements DriverAuthService {
  SupabaseDriverAuthService(this._client, {required this.redirectTo});

  final SupabaseClient _client;
  final String redirectTo;

  @override
  Future<DriverSession?> currentSession() async {
    final session = _client.auth.currentSession;

    if (session == null) {
      return null;
    }

    return DriverSession(
      userId: session.user.id,
      email: session.user.email,
    );
  }

  @override
  Future<void> signInWithGoogle() async {
    await _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: redirectTo.isEmpty ? null : redirectTo,
    );
  }

  @override
  Future<void> signOut() async {
    await _client.auth.signOut();
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
        .subscribe();

    return () {
      unawaited(channel.unsubscribe());
    };
  }
}

class DriverApp extends StatefulWidget {
  const DriverApp({
    required this.driverId,
    required this.service,
    this.realtimeService,
    super.key,
  });

  final String driverId;
  final DriverGigService service;
  final DriverRealtimeService? realtimeService;

  @override
  State<DriverApp> createState() => _DriverAppState();
}

class _DriverAppState extends State<DriverApp> {
  late Future<DriverGigLists> _gigLists;
  VoidCallback? _unsubscribeFromRealtime;

  @override
  void initState() {
    super.initState();
    _gigLists = _loadGigs();
    _unsubscribeFromRealtime =
        widget.realtimeService?.subscribeToRelocationRequestChanges(_refresh);
  }

  Future<DriverGigLists> _loadGigs() async {
    final available = await widget.service.listAvailableGigs();
    final booked = await widget.service.listBookedGigs(widget.driverId);
    final completed = await widget.service.listCompletedGigs(widget.driverId);

    return DriverGigLists(
      available: available,
      booked: booked,
      completed: completed,
    );
  }

  Future<void> _bookGig(DriverGig gig) async {
    await widget.service.bookGig(requestId: gig.id, driverId: widget.driverId);
    _refresh();
  }

  Future<void> _completeGig(DriverGig gig) async {
    await widget.service.completeGig(
      requestId: gig.id,
      driverId: widget.driverId,
    );
    _refresh();
  }

  void _refresh() {
    if (!mounted) {
      return;
    }

    setState(() {
      _gigLists = _loadGigs();
    });
  }

  @override
  void dispose() {
    _unsubscribeFromRealtime?.call();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff6f7f9),
      appBar: AppBar(
        title: const Text('Driver gigs'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff172033),
        elevation: 0,
      ),
      body: FutureBuilder<DriverGigLists>(
        future: _gigLists,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return const Center(child: Text('Unable to load available gigs.'));
          }

          final gigLists = snapshot.data ??
              const DriverGigLists(available: [], booked: [], completed: []);

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text(
                'Available gigs',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              if (gigLists.available.isEmpty)
                const Text('No available gigs yet.')
              else
                ...gigLists.available.map(
                  (gig) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: DriverGigTile(
                      gig: gig,
                      action: ElevatedButton(
                        onPressed: () => _bookGig(gig),
                        child: const Text('Book'),
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              const Text(
                'Booked gigs',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              if (gigLists.booked.isEmpty)
                const Text('No booked gigs yet.')
              else
                Column(
                  key: const ValueKey('booked-gigs'),
                  children: gigLists.booked
                      .map(
                        (gig) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: DriverGigTile(
                            gig: gig,
                            action: ElevatedButton(
                              onPressed: () => _completeGig(gig),
                              child: const Text('Complete'),
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
              const SizedBox(height: 16),
              const Text(
                'Completed gigs',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              if (gigLists.completed.isEmpty)
                const Text('No completed gigs yet.')
              else
                Column(
                  key: const ValueKey('completed-gigs'),
                  children: gigLists.completed
                      .map(
                        (gig) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: DriverGigTile(gig: gig),
                        ),
                      )
                      .toList(),
                ),
            ],
          );
        },
      ),
    );
  }
}

class DriverGigLists {
  const DriverGigLists({
    required this.available,
    required this.booked,
    required this.completed,
  });

  final List<DriverGig> available;
  final List<DriverGig> booked;
  final List<DriverGig> completed;
}

class DriverGigTile extends StatelessWidget {
  const DriverGigTile({required this.gig, this.action, super.key});

  final DriverGig gig;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Color(0xffd9dee8)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${gig.origin} to ${gig.destination}',
              key: const ValueKey('gig-route'),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: const Color(0xff172033),
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              formatScheduledAt(gig.scheduledAt),
              style: const TextStyle(color: Color(0xff546179)),
            ),
            if (gig.notes.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(gig.notes),
            ],
            if (action != null) ...[
              const SizedBox(height: 12),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

String formatScheduledAt(DateTime value) {
  final month = const [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][value.month - 1];
  final hour = value.hour.toString().padLeft(2, '0');
  final minute = value.minute.toString().padLeft(2, '0');

  return '$month ${value.day}, ${value.year}, $hour:$minute';
}
