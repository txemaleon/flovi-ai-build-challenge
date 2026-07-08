import 'package:flutter/material.dart';

void main() {
  runApp(
    MaterialApp(
      title: 'Flovi Driver',
      home: DriverApp(
        service: InMemoryDriverGigService([
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
            status: 'available',
          ),
        ]),
      ),
    ),
  );
}

class DriverGig {
  const DriverGig({
    required this.id,
    required this.origin,
    required this.destination,
    required this.scheduledAt,
    required this.notes,
    required this.status,
  });

  final String id;
  final String origin;
  final String destination;
  final DateTime scheduledAt;
  final String notes;
  final String status;
}

abstract interface class DriverGigService {
  Future<List<DriverGig>> listAvailableGigs();
}

class InMemoryDriverGigService implements DriverGigService {
  InMemoryDriverGigService(this._gigs);

  final List<DriverGig> _gigs;

  @override
  Future<List<DriverGig>> listAvailableGigs() async {
    final available = _gigs
        .where((gig) => gig.status == 'available')
        .toList()
      ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));

    return available;
  }
}

class DriverApp extends StatelessWidget {
  const DriverApp({required this.service, super.key});

  final DriverGigService service;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff6f7f9),
      appBar: AppBar(
        title: const Text('Available gigs'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff172033),
        elevation: 0,
      ),
      body: FutureBuilder<List<DriverGig>>(
        future: service.listAvailableGigs(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return const Center(child: Text('Unable to load available gigs.'));
          }

          final gigs = snapshot.data ?? [];

          if (gigs.isEmpty) {
            return const Center(child: Text('No available gigs yet.'));
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: gigs.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) => DriverGigTile(gig: gigs[index]),
          );
        },
      ),
    );
  }
}

class DriverGigTile extends StatelessWidget {
  const DriverGigTile({required this.gig, super.key});

  final DriverGig gig;

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
