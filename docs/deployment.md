# Flovi Deployment Guide

This guide keeps runtime setup explicit without committing real secrets. Supabase URL and anon keys are public client configuration. Google OAuth client secrets stay in the Supabase dashboard provider settings only.

## Local Setup

1. Install Node dependencies:

   ```sh
   npm install
   ```

2. Copy environment placeholders and fill only local/public values:

   ```sh
   cp .env.example .env
   ```

3. Run verification locally:

   ```sh
   npm test
   npm run coverage
   npm run typecheck
   npm run driver:test
   npm run driver:build
   ```

4. Run the dispatcher locally:

   ```sh
   npm run dispatcher:dev
   ```

5. For driver web development, use Flutter from `apps/driver` if installed locally, or use the Docker-backed root scripts for repeatable test/build verification.

## Supabase Setup

Create a Supabase project, then apply migrations in `supabase/migrations` in timestamp order with your preferred Supabase workflow.

For a linked Supabase CLI project:

```sh
supabase db push
```

For local Supabase development:

```sh
supabase start
supabase db reset
```

The migration `20260708203000_enable_relocation_requests_realtime.sql` enables realtime delivery for `public.relocation_requests` by setting `replica identity full` and adding the table to the `supabase_realtime` publication only when it is not already present.

To load the public demo dataset into a real Supabase project, first create or choose dispatcher and driver auth users in Supabase, then run the seed script with environment variables. The script reads the shared demo dataset from `packages/core`, generates deterministic request UUIDs, and never stores personal user IDs in source:

```sh
SUPABASE_URL=https://<supabase-project-ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
DEMO_DISPATCHER_USER_ID=<dispatcher-auth-user-id> \
DEMO_DRIVER_USER_ID=<primary-driver-auth-user-id> \
DEMO_SECONDARY_DRIVER_USER_ID=<optional-second-driver-auth-user-id> \
npm run seed:demo
```

Use the service role key only from a trusted local or CI environment. Do not expose it to browser or Flutter runtime configuration.

## Google OAuth

Configure Google OAuth in the Supabase dashboard under Authentication > Providers > Google. Store the Google client secret only there.

In Google Cloud Console, add this authorized redirect URI for the OAuth client:

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

In Supabase Authentication > URL Configuration, set the production site URL and additional redirect URLs for each deployed app origin you use, for example:

```text
http://localhost:5173
https://<dispatcher-domain>
https://<driver-domain>
```

For the Flutter driver app, the value passed as `SUPABASE_OAUTH_REDIRECT_URL` must also be allowed in Supabase redirect URLs.

## Dispatcher Web Deployment

The dispatcher is a Vue 3/Vite app in `apps/dispatcher`.

Required Vercel environment variables:

```text
VITE_SUPABASE_URL=https://<supabase-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key>
```

Recommended Vercel project settings:

```text
Root Directory: apps/dispatcher
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

From the monorepo root, the dispatcher build command is:

```sh
npm run dispatcher:build
```

No repo-level `vercel.json` is required for the dispatcher when those project settings are used.

## Driver Flutter Web Deployment

The driver app is a Flutter web app in `apps/driver`. Build it with public Supabase values passed through Dart defines:

```sh
cd apps/driver
flutter pub get
flutter build web --release \
  --dart-define=SUPABASE_URL=https://<supabase-project-ref>.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=<public-anon-key> \
  --dart-define=SUPABASE_OAUTH_REDIRECT_URL=https://<driver-domain>
```

The static output is:

```text
apps/driver/build/web
```

The root Docker-backed build command remains available for repeatable CI-style verification:

```sh
npm run driver:build
```

When deploying the driver to static hosting or Vercel, ensure the build environment has Flutter available and publishes `build/web` from the driver app directory, or build the static files in CI and upload the generated web directory.

## Secrets Checklist

- Do not commit `.env` files with real values.
- Do not add a Google OAuth client secret to Vite, Flutter, Vercel, or checked-in docs.
- Keep Google OAuth provider secrets in Supabase dashboard configuration.
- The Supabase anon key is public client configuration; still manage it through deployment environment settings instead of hard-coding it.
