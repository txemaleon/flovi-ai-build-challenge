# Submission Checklist

## Links

- [x] Dispatcher live URL: https://flovi-dispatcher.vercel.app
- [x] Driver live URL: https://flovi-driver.vercel.app
- [x] Public repo: https://github.com/txemaleon/flovi-ai-build-challenge
- [x] Prompt log: `docs/prompt-log.md`
- [x] Reflection: `docs/reflection.md`
- [x] Walkthrough script: `docs/walkthrough-script.md`

## Final Technical Checks

- [x] Final delivery verification was recorded at commit `d5ac3fe docs(delivery): record final verification status`.
- [x] Delivery commits were pushed to `origin/main`.
- [x] GitHub repository is public.
- [x] GitHub Actions verification passed on the latest reviewed `main` commit: https://github.com/txemaleon/flovi-ai-build-challenge/actions/runs/29002079263
- [x] Vercel dispatcher production deployment is ready: `dpl_Dytog5w5kYygrZiYgpygxAB6DuCi`.
- [x] Vercel driver production deployment is ready: `dpl_EbYgJ6HGm4DkdXBtGqtDDHYK4kjx`.
- [x] Dispatcher production login renders `Sign in with Google`.
- [x] Driver production bundle contains `Sign in with Google`.
- [x] Supabase Google OAuth authorize endpoint returns `302` for dispatcher and driver redirects.
- [x] Production bundles contain the Supabase project reference and driver redirect URL.
- [x] No real secrets are committed; checked docs, env example, scripts, and migrations for obvious secret values.

## Remaining Human Checks

- [ ] Record the 5-minute walkthrough.
- [ ] If time allows, manually sign in once in both production apps before the presentation.
- [ ] Send live URLs and repo link at least 1 hour before the presentation slot.

## Recording Flow

- [ ] Open dispatcher URL.
- [ ] Show Google login or existing signed-in session.
- [ ] Create a relocation request.
- [ ] Edit the request.
- [ ] Filter the dashboard.
- [ ] Open driver URL.
- [ ] Show available gigs and filters.
- [ ] Book one gig.
- [ ] Complete one booked gig.
- [ ] Return to dispatcher and show updated status.
- [ ] Show repo, prompt log, CI workflow, and reflection.

## Submission Message Template

```text
Hi,

Here are the Flovi AI Build Challenge deliverables:

- Dispatcher: https://flovi-dispatcher.vercel.app
- Driver: https://flovi-driver.vercel.app
- Public repository: https://github.com/txemaleon/flovi-ai-build-challenge

The repository includes the prompt/delivery log, task board, reflection, walkthrough script, deployment notes, and CI verification workflow.

Best,
Txema
```
