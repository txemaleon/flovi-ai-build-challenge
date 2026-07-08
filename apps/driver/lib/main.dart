import 'package:flutter/material.dart';

void main() {
  runApp(
    MaterialApp(
      title: 'Flovi Driver',
      home: DriverApp(
        driverId: 'demo-driver',
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

abstract interface class DriverGigService {
  Future<List<DriverGig>> listAvailableGigs();
  Future<List<DriverGig>> listBookedGigs(String driverId);
  Future<DriverGig> bookGig({
    required String requestId,
    required String driverId,
  });
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

  @override
  Future<List<DriverGig>> listBookedGigs(String driverId) async {
    final booked = _gigs
        .where((gig) => gig.status == 'booked' && gig.driverId == driverId)
        .toList()
      ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));

    return booked;
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
}

class DriverApp extends StatefulWidget {
  const DriverApp({required this.driverId, required this.service, super.key});

  final String driverId;
  final DriverGigService service;

  @override
  State<DriverApp> createState() => _DriverAppState();
}

class _DriverAppState extends State<DriverApp> {
  late Future<DriverGigLists> _gigLists;

  @override
  void initState() {
    super.initState();
    _gigLists = _loadGigs();
  }

  Future<DriverGigLists> _loadGigs() async {
    final available = await widget.service.listAvailableGigs();
    final booked = await widget.service.listBookedGigs(widget.driverId);

    return DriverGigLists(available: available, booked: booked);
  }

  Future<void> _bookGig(DriverGig gig) async {
    await widget.service.bookGig(requestId: gig.id, driverId: widget.driverId);
    setState(() {
      _gigLists = _loadGigs();
    });
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

          final gigLists =
              snapshot.data ?? const DriverGigLists(available: [], booked: []);

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
  const DriverGigLists({required this.available, required this.booked});

  final List<DriverGig> available;
  final List<DriverGig> booked;
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
