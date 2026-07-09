import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'src/driver_auth.dart';
part 'src/driver_gig_services.dart';
part 'src/driver_realtime.dart';

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
      theme: FloviDriverTheme.theme,
      home: DriverShell(
        authService: config.hasSupabaseConfig
            ? SupabaseDriverAuthService(
                Supabase.instance.client,
                redirectTo: config.oauthRedirectUrl,
                signOutState: SharedPreferencesDriverSignOutState(),
              )
            : InMemoryDriverAuthService(
                const DriverSession(userId: 'demo-driver'),
                signOutState: SharedPreferencesDriverSignOutState(),
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

class FloviDriverTheme {
  static ThemeData get theme {
    const ink = Color(0xff172033);
    const accent = Color(0xff0f766e);

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: accent,
        brightness: Brightness.light,
        primary: accent,
        surface: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xfff5f6f8),
      textTheme: Typography.blackCupertino.apply(
        bodyColor: ink,
        displayColor: ink,
        fontFamily: 'Inter',
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xffd9dee8)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xffd9dee8)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: accent, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: Colors.white,
          minimumSize: const Size(48, 42),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(foregroundColor: const Color(0xff475569)),
      ),
    );
  }
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
      id: 'demo-001',
      origin: 'Madrid',
      destination: 'Barcelona',
      scheduledAt: DateTime.utc(2026, 7, 10, 9, 30),
      notes: 'Executive sedan ready at the airport lot.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-002',
      origin: 'Barcelona',
      destination: 'Valencia',
      scheduledAt: DateTime.utc(2026, 7, 12, 15),
      notes: 'Bring parking ticket.',
      status: 'booked',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'demo-003',
      origin: 'Valencia',
      destination: 'Alicante',
      scheduledAt: DateTime.utc(2026, 7, 12, 15, 45),
      notes: 'Suggested continuation from Valencia.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-004',
      origin: 'Seville',
      destination: 'Malaga',
      scheduledAt: DateTime.utc(2026, 7, 13, 11),
      notes: 'Completed demo relocation.',
      status: 'completed',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'demo-005',
      origin: 'Malaga',
      destination: 'Marbella',
      scheduledAt: DateTime.utc(2026, 7, 13, 13, 30),
      notes: 'coastal hotel handoff with valet contact.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-006',
      origin: 'Bilbao',
      destination: 'San Sebastian',
      scheduledAt: DateTime.utc(2026, 7, 14, 8, 15),
      notes: 'Cancelled dispatcher request.',
      status: 'cancelled',
    ),
    DriverGig(
      id: 'demo-007',
      origin: 'Zaragoza',
      destination: 'Madrid',
      scheduledAt: DateTime.utc(2026, 7, 14, 8),
      notes: 'SUV, return paperwork in glovebox.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-008',
      origin: 'A Coruna',
      destination: 'Bilbao',
      scheduledAt: DateTime.utc(2026, 7, 14, 10, 30),
      notes: 'Booked northern corridor relocation.',
      status: 'booked',
      driverId: 'demo-driver-2',
    ),
    DriverGig(
      id: 'demo-009',
      origin: 'Palma',
      destination: 'Barcelona',
      scheduledAt: DateTime.utc(2026, 7, 14, 12, 15),
      notes: 'Ferry arrival confirmed.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-010',
      origin: 'Alicante',
      destination: 'Valencia',
      scheduledAt: DateTime.utc(2026, 7, 14, 17, 30),
      notes: 'Completed same-day coastal return.',
      status: 'completed',
      driverId: 'demo-driver-2',
    ),
    DriverGig(
      id: 'demo-011',
      origin: 'Madrid',
      destination: 'Seville',
      scheduledAt: DateTime.utc(2026, 7, 15, 7, 45),
      notes: 'Open request, train station delivery.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-012',
      origin: 'San Sebastian',
      destination: 'Bilbao',
      scheduledAt: DateTime.utc(2026, 7, 15, 9),
      notes: 'Booked short-hop handoff.',
      status: 'booked',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'demo-013',
      origin: 'Bilbao',
      destination: 'Zaragoza',
      scheduledAt: DateTime.utc(2026, 7, 15, 12, 30),
      notes: 'Suggested after Bilbao drop-off.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-014',
      origin: 'Barcelona',
      destination: 'Palma',
      scheduledAt: DateTime.utc(2026, 7, 15, 18, 45),
      notes: 'Cancelled due to ferry delay.',
      status: 'cancelled',
    ),
    DriverGig(
      id: 'demo-015',
      origin: 'Marbella',
      destination: 'Malaga',
      scheduledAt: DateTime.utc(2026, 7, 16, 8, 20),
      notes: 'Convertible, pickup at resort valet.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-016',
      origin: 'Valencia',
      destination: 'Zaragoza',
      scheduledAt: DateTime.utc(2026, 7, 16, 10, 10),
      notes: 'Completed regional fleet balancing move.',
      status: 'completed',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'demo-017',
      origin: 'Malaga',
      destination: 'Seville',
      scheduledAt: DateTime.utc(2026, 7, 16, 14),
      notes: 'Booked airport-to-city relocation.',
      status: 'booked',
      driverId: 'demo-driver-2',
    ),
    DriverGig(
      id: 'demo-018',
      origin: 'Alicante',
      destination: 'Madrid',
      scheduledAt: DateTime.utc(2026, 7, 17, 8, 45),
      notes: 'Open high-priority sedan transfer.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-019',
      origin: 'Seville',
      destination: 'Marbella',
      scheduledAt: DateTime.utc(2026, 7, 17, 12),
      notes: 'Cancelled by dispatcher after duplicate booking.',
      status: 'cancelled',
    ),
    DriverGig(
      id: 'demo-020',
      origin: 'Zaragoza',
      destination: 'Barcelona',
      scheduledAt: DateTime.utc(2026, 7, 17, 15, 15),
      notes: 'Open EV transfer, charging cable included.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-021',
      origin: 'A Coruna',
      destination: 'Madrid',
      scheduledAt: DateTime.utc(2026, 7, 18, 9, 30),
      notes: 'Completed long-haul delivery.',
      status: 'completed',
      driverId: 'demo-driver-2',
    ),
    DriverGig(
      id: 'demo-022',
      origin: 'Palma',
      destination: 'Alicante',
      scheduledAt: DateTime.utc(2026, 7, 18, 13, 40),
      notes: 'Open island arrival request.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-023',
      origin: 'Madrid',
      destination: 'A Coruna',
      scheduledAt: DateTime.utc(2026, 7, 18, 16, 25),
      notes: 'Booked northbound delivery.',
      status: 'booked',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'demo-024',
      origin: 'Barcelona',
      destination: 'Bilbao',
      scheduledAt: DateTime.utc(2026, 7, 19, 8, 5),
      notes: 'Open dealer exchange.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-025',
      origin: 'San Sebastian',
      destination: 'A Coruna',
      scheduledAt: DateTime.utc(2026, 7, 19, 11, 50),
      notes: 'Completed northern coast transfer.',
      status: 'completed',
      driverId: 'demo-driver',
    ),
    DriverGig(
      id: 'demo-026',
      origin: 'Marbella',
      destination: 'Valencia',
      scheduledAt: DateTime.utc(2026, 7, 19, 17, 35),
      notes: 'Cancelled maintenance hold.',
      status: 'cancelled',
    ),
    DriverGig(
      id: 'demo-027',
      origin: 'Malaga',
      destination: 'Marbella',
      scheduledAt: DateTime.utc(2026, 7, 21, 9),
      notes: 'Later coastal request outside the default window.',
      status: 'available',
    ),
    DriverGig(
      id: 'demo-028',
      origin: 'Bilbao',
      destination: 'Madrid',
      scheduledAt: DateTime.utc(2026, 7, 21, 15, 20),
      notes: 'Booked return to central fleet.',
      status: 'booked',
      driverId: 'demo-driver-2',
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
  VoidCallback subscribeToAuthChanges(ValueChanged<DriverSession?> onChange);
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
  VoidCallback? _unsubscribeFromAuth;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _session = widget.authService.currentSession();
    _unsubscribeFromAuth = widget.authService.subscribeToAuthChanges(
      _replaceSession,
    );
  }

  void _replaceSession(DriverSession? session) {
    if (!mounted) {
      return;
    }

    setState(() {
      _session = Future.value(session);
      _errorMessage = null;
    });
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
      _session = Future.value(null);
    });
  }

  @override
  void dispose() {
    _unsubscribeFromAuth?.call();
    super.dispose();
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
            backgroundColor: const Color(0xfff5f6f8),
            body: SafeArea(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: ConstrainedBox(
                    key: const ValueKey('driver-sign-in-card'),
                    constraints: const BoxConstraints(maxWidth: 576),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x100f172a),
                            blurRadius: 24,
                            offset: Offset(0, 10),
                          ),
                          BoxShadow(color: Color(0x0f0f172a), spreadRadius: 1),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Driver operations',
                              style: TextStyle(
                                color: Color(0xff64748b),
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Sign in to browse and book gigs',
                              style: TextStyle(
                                color: Color(0xff172033),
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Use your dispatcher-approved Google account to view open, booked, and completed relocations.',
                              style: TextStyle(
                                color: Color(0xff64748b),
                                fontSize: 14,
                                height: 1.45,
                              ),
                            ),
                            const SizedBox(height: 20),
                            GoogleSignInButton(onPressed: _signInWithGoogle),
                            if (_errorMessage != null) ...[
                              const SizedBox(height: 12),
                              DecoratedBox(
                                decoration: BoxDecoration(
                                  color: const Color(0xfffff1f2),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: const Color(0x1fb91c1c),
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(10),
                                  child: Text(
                                    _errorMessage!,
                                    style: const TextStyle(
                                      color: Color(0xffb91c1c),
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
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

class GoogleSignInButton extends StatelessWidget {
  const GoogleSignInButton({required this.onPressed, super.key});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      key: const ValueKey('google-sign-in-button'),
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff27272a),
        minimumSize: const Size.fromHeight(44),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        side: const BorderSide(color: Color(0xffd4d4d8)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          letterSpacing: 0,
        ),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          GoogleGIcon(),
          SizedBox(width: 12),
          Text('Sign in with Google'),
        ],
      ),
    );
  }
}

class GoogleGIcon extends StatelessWidget {
  const GoogleGIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      key: ValueKey('google-g-icon'),
      height: 20,
      width: 20,
      child: CustomPaint(painter: GoogleGIconPainter()),
    );
  }
}

class GoogleGIconPainter extends CustomPainter {
  const GoogleGIconPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final strokeWidth = size.width * 0.18;
    final arcRect = rect.deflate(strokeWidth / 2);

    void drawArc(Color color, double start, double sweep) {
      canvas.drawArc(
        arcRect,
        start,
        sweep,
        false,
        Paint()
          ..color = color
          ..strokeCap = StrokeCap.square
          ..strokeWidth = strokeWidth
          ..style = PaintingStyle.stroke,
      );
    }

    drawArc(const Color(0xff4285f4), -0.08, 1.55);
    drawArc(const Color(0xff34a853), 1.47, 1.05);
    drawArc(const Color(0xfffbbc05), 2.52, 1.15);
    drawArc(const Color(0xffea4335), 3.67, 1.55);

    final bluePaint = Paint()
      ..color = const Color(0xff4285f4)
      ..strokeCap = StrokeCap.square
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;
    canvas.drawLine(
      Offset(size.width * 0.52, size.height * 0.5),
      Offset(size.width * 0.94, size.height * 0.5),
      bluePaint,
    );
    canvas.drawLine(
      Offset(size.width * 0.86, size.height * 0.5),
      Offset(size.width * 0.86, size.height * 0.68),
      bluePaint,
    );
  }

  @override
  bool shouldRepaint(covariant GoogleGIconPainter oldDelegate) => false;
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
  String _originFilter = '';
  String _destinationFilter = '';
  String _fromFilter = '';
  String _toFilter = '';

  @override
  void initState() {
    super.initState();
    _gigLists = _loadGigs();
    _subscribeToRealtime();
  }

  @override
  void didUpdateWidget(DriverApp oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.realtimeService != widget.realtimeService ||
        oldWidget.driverId != widget.driverId) {
      _unsubscribeFromRealtime?.call();
      _subscribeToRealtime();
      _refresh();
    }
  }

  void _subscribeToRealtime() {
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
      backgroundColor: const Color(0xfff5f6f8),
      appBar: AppBar(
        toolbarHeight: 56,
        title: const Text(
          'Driver gigs',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff172033),
        surfaceTintColor: Colors.white,
        elevation: 0.5,
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
          final filteredAvailable = filterDriverGigs(
            gigLists.available,
            origin: _originFilter,
            destination: _destinationFilter,
            fromDate: _fromFilter,
            toDate: _toFilter,
          );
          final suggestedNext = suggestedNextGigs(gigLists);
          final placeOptions = driverPlaceOptions(gigLists);

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: [
              DecoratedBox(
                key: const ValueKey('driver-filter-panel'),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xffe2e8f0)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x0a0f172a),
                      blurRadius: 10,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Find routes',
                        style: TextStyle(
                          color: Color(0xff334155),
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final shouldStack = constraints.maxWidth < 320;

                          return Column(
                            children: [
                              FilterFieldRow(
                                key: const ValueKey('driver-place-filter-row'),
                                shouldStack: shouldStack,
                                fields: [
                                  DriverPlaceAutocompleteField(
                                    fieldKey:
                                        const ValueKey('driver-origin-filter'),
                                    label: 'Origin',
                                    optionKeyPrefix: 'driver-origin-option',
                                    options: placeOptions,
                                    onChanged: (value) => setState(
                                      () => _originFilter = value,
                                    ),
                                  ),
                                  DriverPlaceAutocompleteField(
                                    fieldKey: const ValueKey(
                                      'driver-destination-filter',
                                    ),
                                    label: 'Destination',
                                    optionKeyPrefix:
                                        'driver-destination-option',
                                    options: placeOptions,
                                    onChanged: (value) => setState(
                                      () => _destinationFilter = value,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              FilterFieldRow(
                                key: const ValueKey('driver-date-filter-row'),
                                shouldStack: shouldStack,
                                fields: [
                                  DriverDateFilterField(
                                    fieldKey:
                                        const ValueKey('driver-from-filter'),
                                    label: 'From',
                                    value: _fromFilter,
                                    onChanged: (value) =>
                                        setState(() => _fromFilter = value),
                                  ),
                                  DriverDateFilterField(
                                    fieldKey:
                                        const ValueKey('driver-to-filter'),
                                    label: 'To',
                                    value: _toFilter,
                                    onChanged: (value) =>
                                        setState(() => _toFilter = value),
                                  ),
                                ],
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                key: const ValueKey('driver-status-navigation'),
                spacing: 8,
                runSpacing: 8,
                children: [
                  StatusChip(label: 'Open', count: filteredAvailable.length),
                  StatusChip(label: 'Booked', count: gigLists.booked.length),
                  StatusChip(
                    label: 'Completed',
                    count: gigLists.completed.length,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              if (suggestedNext.isNotEmpty) ...[
                const SectionTitle('Suggested next'),
                const SizedBox(height: 12),
                Column(
                  key: const ValueKey('suggested-next-gigs'),
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: suggestedNext
                      .map(
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
                      )
                      .toList(),
                ),
                const SizedBox(height: 8),
              ],
              const SectionTitle('Available gigs'),
              const SizedBox(height: 12),
              if (filteredAvailable.isEmpty)
                const EmptySection(message: 'No available gigs yet.')
              else
                AvailableGigGrid(
                  key: const ValueKey('available-gigs'),
                  gigs: filteredAvailable,
                  buildAction: (gig) => ElevatedButton(
                    onPressed: () => _bookGig(gig),
                    child: const Text('Book'),
                  ),
                ),
              const SizedBox(height: 16),
              DriverGigDisclosureSection(
                tileKey: const ValueKey('booked-gigs-dropdown'),
                title: 'Booked gigs',
                countLabel: 'Booked',
                count: gigLists.booked.length,
                emptyMessage: 'No booked gigs yet.',
                contentKey: const ValueKey('booked-gigs'),
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
              DriverGigDisclosureSection(
                tileKey: const ValueKey('completed-gigs-dropdown'),
                title: 'Completed gigs',
                countLabel: 'Completed',
                count: gigLists.completed.length,
                emptyMessage: 'No completed gigs yet.',
                contentKey: const ValueKey('completed-gigs'),
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

class DriverPlaceAutocompleteField extends StatelessWidget {
  const DriverPlaceAutocompleteField({
    required this.fieldKey,
    required this.label,
    required this.optionKeyPrefix,
    required this.options,
    required this.onChanged,
    super.key,
  });

  final Key fieldKey;
  final String label;
  final String optionKeyPrefix;
  final List<String> options;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Autocomplete<String>(
      optionsBuilder: (textEditingValue) {
        final query = textEditingValue.text;

        if (query.trim().isEmpty) {
          return const Iterable<String>.empty();
        }

        return options.where((option) => placeMatches(option, query)).take(8);
      },
      onSelected: onChanged,
      fieldViewBuilder: (
        context,
        textEditingController,
        focusNode,
        onFieldSubmitted,
      ) {
        return TextField(
          key: fieldKey,
          controller: textEditingController,
          focusNode: focusNode,
          decoration: InputDecoration(
            labelText: label,
            suffixIcon: const Icon(Icons.search, size: 18),
          ),
          onChanged: onChanged,
          textInputAction: TextInputAction.search,
        );
      },
      optionsViewBuilder: (context, onSelected, options) {
        return Align(
          alignment: Alignment.topLeft,
          child: Material(
            color: Colors.white,
            elevation: 8,
            shadowColor: const Color(0x1a0f172a),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: const BorderSide(color: Color(0xffd9dee8)),
            ),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 220, maxWidth: 360),
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 4),
                shrinkWrap: true,
                itemCount: options.length,
                itemBuilder: (context, index) {
                  final option = options.elementAt(index);

                  return InkWell(
                    key: ValueKey('$optionKeyPrefix-$option'),
                    onTap: () => onSelected(option),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      child: Text(
                        option,
                        style: const TextStyle(
                          color: Color(0xff172033),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }
}

class DriverDateFilterField extends StatefulWidget {
  const DriverDateFilterField({
    required this.fieldKey,
    required this.label,
    required this.value,
    required this.onChanged,
    super.key,
  });

  final Key fieldKey;
  final String label;
  final String value;
  final ValueChanged<String> onChanged;

  @override
  State<DriverDateFilterField> createState() => _DriverDateFilterFieldState();
}

class _DriverDateFilterFieldState extends State<DriverDateFilterField> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(DriverDateFilterField oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.value != _controller.text) {
      _controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: widget.value.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Future<void> pickDate() async {
      final parsedDate = parseDateStart(widget.value);
      final picked = await showDatePicker(
        context: context,
        initialDate: parsedDate ?? DateTime.utc(2026, 7, 10),
        firstDate: DateTime.utc(2026),
        lastDate: DateTime.utc(2027, 12, 31),
      );

      if (picked != null) {
        widget.onChanged(formatDateInput(picked));
      }
    }

    return TextField(
      key: widget.fieldKey,
      controller: _controller,
      decoration: InputDecoration(
        labelText: widget.label,
        hintText: 'YYYY-MM-DD',
        suffixIcon: IconButton(
          tooltip: 'Pick ${widget.label} date',
          icon: const Icon(Icons.calendar_today_outlined, size: 18),
          onPressed: pickDate,
        ),
      ),
      keyboardType: TextInputType.datetime,
      onChanged: widget.onChanged,
    );
  }
}

class DriverGigDisclosureSection extends StatelessWidget {
  const DriverGigDisclosureSection({
    required this.tileKey,
    required this.title,
    required this.countLabel,
    required this.count,
    required this.emptyMessage,
    required this.contentKey,
    required this.children,
    super.key,
  });

  final Key tileKey;
  final String title;
  final String countLabel;
  final int count;
  final String emptyMessage;
  final Key contentKey;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 1,
      shadowColor: const Color(0x140f172a),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Color(0xffd9dee8)),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          key: tileKey,
          tilePadding: const EdgeInsets.symmetric(horizontal: 12),
          childrenPadding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          title: Row(
            children: [
              Expanded(child: SectionTitle(title)),
              StatusChip(label: countLabel, count: count),
            ],
          ),
          children: [
            if (children.isEmpty)
              EmptySection(message: emptyMessage)
            else
              Column(
                key: contentKey,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: children,
              ),
          ],
        ),
      ),
    );
  }
}

class FilterFieldRow extends StatelessWidget {
  const FilterFieldRow({
    required this.fields,
    required this.shouldStack,
    super.key,
  });

  final List<Widget> fields;
  final bool shouldStack;

  @override
  Widget build(BuildContext context) {
    if (shouldStack) {
      return Column(
        children: [
          for (final field in fields) ...[
            field,
            if (field != fields.last) const SizedBox(height: 10),
          ],
        ],
      );
    }

    return Row(
      children: [
        Expanded(child: fields.first),
        const SizedBox(width: 10),
        Expanded(child: fields.last),
      ],
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        color: Color(0xff172033),
        fontSize: 18,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

class AvailableGigGrid extends StatelessWidget {
  const AvailableGigGrid({
    required this.gigs,
    required this.buildAction,
    super.key,
  });

  final List<DriverGig> gigs;
  final Widget Function(DriverGig gig) buildAction;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = availableGigColumnCount(constraints.maxWidth);

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            mainAxisExtent: 244,
          ),
          itemCount: gigs.length,
          itemBuilder: (context, index) {
            final gig = gigs[index];

            return DriverGigTile(
              key: ValueKey('gig-card-${gig.id}'),
              gig: gig,
              action: buildAction(gig),
            );
          },
        );
      },
    );
  }
}

int availableGigColumnCount(double width) {
  if (width >= 1100) {
    return 5;
  }

  if (width >= 700) {
    return 3;
  }

  return 1;
}

class StatusChip extends StatelessWidget {
  const StatusChip({required this.label, required this.count, super.key});

  final String label;
  final int count;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xffeef2f7),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xffe2e8f0)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Text(
          '$label $count',
          style: const TextStyle(
            color: Color(0xff334155),
            fontSize: 13,
            fontFeatures: [FontFeature.tabularFigures()],
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class EmptySection extends StatelessWidget {
  const EmptySection({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xfff8fafc),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xffe2e8f0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Text(
          message,
          style: const TextStyle(color: Color(0xff64748b), fontSize: 14),
        ),
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
      elevation: 0.5,
      shadowColor: const Color(0x140f172a),
      surfaceTintColor: Colors.white,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Color(0xffd9dee8)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${gig.origin} to ${gig.destination}',
              key: const ValueKey('gig-route'),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: const Color(0xff172033),
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              formatScheduledAt(gig.scheduledAt),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Color(0xff546179), fontSize: 14),
            ),
            if (gig.notes.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                gig.notes,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 14, height: 1.25),
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 10),
              SizedBox(width: double.infinity, child: action!),
            ],
          ],
        ),
      ),
    );
  }
}

List<DriverGig> filterDriverGigs(
  List<DriverGig> gigs, {
  required String origin,
  required String destination,
  required String fromDate,
  required String toDate,
}) {
  final from = parseDateStart(fromDate);
  final to = parseDateEnd(toDate);

  return gigs
      .where((gig) => placeMatches(gig.origin, origin))
      .where((gig) => placeMatches(gig.destination, destination))
      .where((gig) => from == null || !gig.scheduledAt.isBefore(from))
      .where((gig) => to == null || !gig.scheduledAt.isAfter(to))
      .toList()
    ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));
}

List<String> driverPlaceOptions(DriverGigLists gigLists) {
  final options = <String>{};

  for (final gig in [
    ...gigLists.available,
    ...gigLists.booked,
    ...gigLists.completed,
  ]) {
    options
      ..add(gig.origin)
      ..add(gig.destination);
  }

  return options.toList()
    ..sort((left, right) => left.toLowerCase().compareTo(right.toLowerCase()));
}

bool placeMatches(String place, String query) {
  final normalizedQuery = normalizePlace(query);

  return normalizedQuery.isEmpty ||
      normalizePlace(place).contains(normalizedQuery);
}

String normalizePlace(String value) {
  return value
      .trim()
      .toLowerCase()
      .replaceAll('á', 'a')
      .replaceAll('à', 'a')
      .replaceAll('é', 'e')
      .replaceAll('è', 'e')
      .replaceAll('í', 'i')
      .replaceAll('ï', 'i')
      .replaceAll('ó', 'o')
      .replaceAll('ò', 'o')
      .replaceAll('ú', 'u')
      .replaceAll('ü', 'u')
      .replaceAll('ñ', 'n');
}

List<DriverGig> suggestedNextGigs(DriverGigLists gigLists) {
  final history = [...gigLists.booked, ...gigLists.completed]
    ..sort((left, right) => right.scheduledAt.compareTo(left.scheduledAt));

  if (history.isEmpty) {
    return [];
  }

  final latest = history.first;

  return gigLists.available
      .where((gig) => gig.origin == latest.destination)
      .where((gig) => gig.scheduledAt.isAfter(latest.scheduledAt))
      .toList()
    ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));
}

DateTime? parseDateStart(String value) {
  final parsed = DateTime.tryParse(value.trim());
  return parsed == null
      ? null
      : DateTime.utc(parsed.year, parsed.month, parsed.day);
}

DateTime? parseDateEnd(String value) {
  final parsed = DateTime.tryParse(value.trim());
  return parsed == null
      ? null
      : DateTime.utc(parsed.year, parsed.month, parsed.day, 23, 59, 59, 999);
}

String formatDateInput(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');

  return '${value.year}-$month-$day';
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
