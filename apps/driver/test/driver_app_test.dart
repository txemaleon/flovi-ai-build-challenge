import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flovi_driver/main.dart';

void main() {
  test('in-memory driver gig service returns available gigs sorted by time', () async {
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
}
