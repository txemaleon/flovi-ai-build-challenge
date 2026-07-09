# Final Delivery Status

Last updated: 2026-07-09 08:36 CEST.

## Public Deliverables

- Dispatcher: https://flovi-dispatcher.vercel.app
- Driver: https://flovi-driver.vercel.app
- Public repo: https://github.com/txemaleon/flovi-ai-build-challenge
- Prompt log: [docs/prompt-log.md](prompt-log.md)
- Reflection: [docs/reflection.md](reflection.md)
- Walkthrough script: [docs/walkthrough-script.md](walkthrough-script.md)
- Presentation prep: [docs/presentation-prep.md](presentation-prep.md)

## Repository

- Branch: `main`
- Delivery packaging commit: `dc877be docs(delivery): package presentation artifacts`
- Latest GitHub Actions verification for that commit: success
- Workflow run: https://github.com/txemaleon/flovi-ai-build-challenge/actions/runs/28998831983
- Repository visibility: public

## Production Deployments

The Vercel projects are static-upload projects rather than Git-linked projects, so the production deploys were promoted manually from the current local app builds.

- Dispatcher production deployment: `dpl_Dytog5w5kYygrZiYgpygxAB6DuCi`
- Dispatcher production alias: https://flovi-dispatcher.vercel.app
- Driver production deployment: `dpl_EbYgJ6HGm4DkdXBtGqtDDHYK4kjx`
- Driver production alias: https://flovi-driver.vercel.app

## Smoke Checks

Passed:

- Dispatcher public URL returns HTTP 200.
- Driver public URL returns HTTP 200.
- Dispatcher production bundle contains the Supabase project reference.
- Driver production bundle contains the Supabase project reference.
- Driver production bundle contains `https://flovi-driver.vercel.app` as OAuth redirect URL.
- Dispatcher production login screen renders `Sign in with Google`.
- Driver production bundle contains `Sign in with Google`.
- Supabase Google OAuth authorize endpoint returns `302` for the dispatcher redirect URL.
- Supabase Google OAuth authorize endpoint returns `302` for the driver redirect URL.

Known limitation:

- Flutter Web renders most app UI through Flutter's web surface, so DOM-level browser inspection is limited. The requested driver layout is covered by Flutter widget tests and screenshot artifacts under `docs/assets/ui-polish/`.
