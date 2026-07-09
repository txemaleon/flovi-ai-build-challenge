part of '../main.dart';

abstract interface class DriverSignOutState {
  Future<bool> isSignedOut();
  Future<void> markSignedOut();
  Future<void> clearSignedOut();
}

class InMemoryDriverSignOutState implements DriverSignOutState {
  bool _signedOut = false;

  @override
  Future<bool> isSignedOut() async => _signedOut;

  @override
  Future<void> markSignedOut() async {
    _signedOut = true;
  }

  @override
  Future<void> clearSignedOut() async {
    _signedOut = false;
  }
}

class SharedPreferencesDriverSignOutState implements DriverSignOutState {
  static const _key = 'flovi_driver_signed_out';

  @override
  Future<bool> isSignedOut() async {
    final preferences = await SharedPreferences.getInstance();

    return preferences.getBool(_key) ?? false;
  }

  @override
  Future<void> markSignedOut() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setBool(_key, true);
  }

  @override
  Future<void> clearSignedOut() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_key);
  }
}

class InMemoryDriverAuthService implements DriverAuthService {
  InMemoryDriverAuthService(
    this._session, {
    DriverSignOutState? signOutState,
  }) : _signOutState = signOutState ?? InMemoryDriverSignOutState();

  final DriverSignOutState _signOutState;
  DriverSession? _session;
  ValueChanged<DriverSession?>? _onAuthChange;

  @override
  Future<DriverSession?> currentSession() async {
    if (await _signOutState.isSignedOut()) {
      return null;
    }

    return _session;
  }

  @override
  VoidCallback subscribeToAuthChanges(ValueChanged<DriverSession?> onChange) {
    _onAuthChange = onChange;

    return () {
      if (_onAuthChange == onChange) {
        _onAuthChange = null;
      }
    };
  }

  @override
  Future<void> signInWithGoogle() async {
    await _signOutState.clearSignedOut();
    _session ??= const DriverSession(userId: 'demo-driver');
    _onAuthChange?.call(_session);
  }

  @override
  Future<void> signOut() async {
    _session = null;
    await _signOutState.markSignedOut();
    _onAuthChange?.call(null);
  }
}

class SupabaseDriverAuthService implements DriverAuthService {
  SupabaseDriverAuthService(
    this._client, {
    required this.redirectTo,
    DriverSignOutState? signOutState,
  }) : _signOutState = signOutState ?? SharedPreferencesDriverSignOutState();

  final SupabaseClient _client;
  final String redirectTo;
  final DriverSignOutState _signOutState;

  @override
  Future<DriverSession?> currentSession() async {
    if (await _signOutState.isSignedOut()) {
      return null;
    }

    return _mapSession(_client.auth.currentSession);
  }

  @override
  VoidCallback subscribeToAuthChanges(ValueChanged<DriverSession?> onChange) {
    final subscription = _client.auth.onAuthStateChange.listen((state) async {
      if (await _signOutState.isSignedOut()) {
        onChange(null);
        return;
      }

      onChange(_mapSession(state.session));
    });

    return () {
      unawaited(subscription.cancel());
    };
  }

  @override
  Future<void> signInWithGoogle() async {
    await _signOutState.clearSignedOut();
    await _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: redirectTo.isEmpty ? null : redirectTo,
    );
  }

  @override
  Future<void> signOut() async {
    await _client.auth.signOut(scope: SignOutScope.global);
    await _signOutState.markSignedOut();
  }

  DriverSession? _mapSession(Session? session) {
    if (session == null) {
      return null;
    }

    return DriverSession(
      userId: session.user.id,
      email: session.user.email,
    );
  }
}
