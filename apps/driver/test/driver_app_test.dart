import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flovi_driver/main.dart';

void main() {
  test('in-memory driver gig service returns available gigs sorted by time',
      () async {
    final service = InMemoryDriverGigService([
      DriverGig(
        id: 'gig-later',
        origin: 'Barcelona Sants',
        destination: 'Valencia Port',
        scheduledAt: DateTime.utc(2026, 7, 12, 15),
        notes: 'Later available request',
        status: 'available',
      ),
      DriverGig(
        id: 'gig-earlier',
        origin: 'Madrid Chamartin',
        destination: 'Seville Station',
        scheduledAt: DateTime.utc(2026, 7, 10, 9, 30),
        notes: 'Earlier available request',
        status: 'available',
      ),
    ]);

    final gigs = await service.listAvailableGigs();

    expect(gigs.map((gig) => gig.id), ['gig-earlier', 'gig-later']);
  });

  test('in-memory driver gig service books one available gig', () async {
    final service = InMemoryDriverGigService([
      DriverGig(
        id: 'gig-available',
        origin: 'Madrid Chamartin',
        destination: 'Seville Station',
        scheduledAt: DateTime.utc(2026, 7, 10, 9, 30),
        notes: 'Available request',
        status: 'available',
      ),
    ]);

    final booked = await service.bookGig(
      requestId: 'gig-available',
      driverId: 'driver-1',
    );

    expect(booked.status, 'booked');
    expect(booked.driverId, 'driver-1');
    expect(await service.listAvailableGigs(), isEmpty);
    expect(
      (await service.listBookedGigs('driver-1')).map((gig) => gig.id),
      ['gig-available'],
    );
  });

  testWidgets('driver app renders available gigs sorted by scheduled time', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: DriverApp(
          driverId: 'driver-1',
          service: InMemoryDriverGigService([
            DriverGig(
              id: 'gig-later',
              origin: 'Barcelona Sants',
              destination: 'Valencia Port',
              scheduledAt: DateTime.utc(2026, 7, 12, 15),
              notes: 'Later available request',
              status: 'available',
            ),
            DriverGig(
              id: 'gig-earlier',
              origin: 'Madrid Chamartin',
              destination: 'Seville Station',
              scheduledAt: DateTime.utc(2026, 7, 10, 9, 30),
              notes: 'Earlier available request',
              status: 'available',
            ),
          ]),
        ),
      ),
    );

    await tester.pumpAndSettle();

    final routes = tester
        .widgetList<Text>(find.byKey(const ValueKey('gig-route')))
        .map((text) => text.data)
        .toList();

    expect(routes, [
      'Madrid Chamartin to Seville Station',
      'Barcelona Sants to Valencia Port',
    ]);
  });

  testWidgets('driver books a gig and sees it in the booked list', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: DriverApp(
          driverId: 'driver-1',
          service: InMemoryDriverGigService([
            DriverGig(
              id: 'gig-available',
              origin: 'Madrid Chamartin',
              destination: 'Seville Station',
              scheduledAt: DateTime.utc(2026, 7, 10, 9, 30),
              notes: 'Available request',
              status: 'available',
            ),
          ]),
        ),
      ),
    );

    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(ElevatedButton, 'Book'));
    await tester.pumpAndSettle();

    expect(find.text('No available gigs yet.'), findsOneWidget);
    expect(find.text('Booked gigs'), findsOneWidget);
    expect(
      find.descendant(
        of: find.byKey(const ValueKey('booked-gigs')),
        matching: find.text('Madrid Chamartin to Seville Station'),
      ),
      findsOneWidget,
    );
  });

  testWidgets('driver shell shows Google sign-in when signed out', (
    tester,
  ) async {
    final authService = FakeDriverAuthService();

    await tester.pumpWidget(
      MaterialApp(
        home: DriverShell(
          authService: authService,
          createGigService: (_) => InMemoryDriverGigService([]),
        ),
      ),
    );

    await tester.pumpAndSettle();
    await tester
        .tap(find.widgetWithText(ElevatedButton, 'Sign in with Google'));
    await tester.pumpAndSettle();

    expect(find.text('Sign in with Google'), findsOneWidget);
    expect(authService.signInCalls, 1);
  });

  testWidgets('driver shell renders signed-in gigs for the current driver', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: DriverShell(
          authService: FakeDriverAuthService(
            session: const DriverSession(userId: 'driver-1'),
          ),
          createGigService: (session) => InMemoryDriverGigService([
            DriverGig(
              id: 'gig-available',
              origin: 'Madrid Chamartin',
              destination: 'Seville Station',
              scheduledAt: DateTime.utc(2026, 7, 10, 9, 30),
              notes: 'Available request',
              status: 'available',
            ),
            DriverGig(
              id: 'gig-booked',
              origin: 'Barcelona Sants',
              destination: 'Valencia Port',
              scheduledAt: DateTime.utc(2026, 7, 12, 15),
              notes: 'Booked request',
              status: 'booked',
              driverId: session.userId,
            ),
          ]),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Madrid Chamartin to Seville Station'), findsOneWidget);
    expect(
      find.descendant(
        of: find.byKey(const ValueKey('booked-gigs')),
        matching: find.text('Barcelona Sants to Valencia Port'),
      ),
      findsOneWidget,
    );
    expect(find.widgetWithText(TextButton, 'Sign out'), findsOneWidget);
  });

  testWidgets('driver shell signs out from the authenticated state', (
    tester,
  ) async {
    final authService = FakeDriverAuthService(
      session: const DriverSession(userId: 'driver-1'),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: DriverShell(
          authService: authService,
          createGigService: (_) => InMemoryDriverGigService([]),
        ),
      ),
    );

    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(TextButton, 'Sign out'));
    await tester.pumpAndSettle();

    expect(authService.signOutCalls, 1);
    expect(find.text('Sign in with Google'), findsOneWidget);
  });

  testWidgets('driver app shows a clear gig loading error', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: DriverApp(
          driverId: 'driver-1',
          service: FailingDriverGigService(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Unable to load available gigs.'), findsOneWidget);
  });

  testWidgets('driver shell shows a clear sign-in error', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: DriverShell(
          authService: FakeDriverAuthService(
            signInError: StateError('OAuth failed'),
          ),
          createGigService: (_) => InMemoryDriverGigService([]),
        ),
      ),
    );

    await tester.pumpAndSettle();
    await tester
        .tap(find.widgetWithText(ElevatedButton, 'Sign in with Google'));
    await tester.pumpAndSettle();

    expect(find.text('OAuth failed'), findsOneWidget);
  });
}

class FailingDriverGigService implements DriverGigService {
  @override
  Future<List<DriverGig>> listAvailableGigs() async {
    throw StateError('database unavailable');
  }

  @override
  Future<List<DriverGig>> listBookedGigs(String driverId) async => [];

  @override
  Future<DriverGig> bookGig({
    required String requestId,
    required String driverId,
  }) async {
    throw StateError('database unavailable');
  }
}

class FakeDriverAuthService implements DriverAuthService {
  FakeDriverAuthService({this.session, this.signInError});

  DriverSession? session;
  Object? signInError;
  int signInCalls = 0;
  int signOutCalls = 0;

  @override
  Future<DriverSession?> currentSession() async => session;

  @override
  Future<void> signInWithGoogle() async {
    signInCalls += 1;

    if (signInError != null) {
      throw signInError!;
    }
  }

  @override
  Future<void> signOut() async {
    signOutCalls += 1;
    session = null;
  }
}
