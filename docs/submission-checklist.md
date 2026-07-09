# Submission Checklist

## Links

- [ ] Dispatcher live URL: https://flovi-dispatcher.vercel.app
- [ ] Driver live URL: https://flovi-driver.vercel.app
- [ ] Public repo: https://github.com/txemaleon/flovi-ai-build-challenge
- [ ] Prompt log: `docs/prompt-log.md`
- [ ] Reflection: `docs/reflection.md`
- [ ] Walkthrough script: `docs/walkthrough-script.md`

## Final Technical Checks

- [ ] `git status --short` is clean.
- [ ] Latest commit is pushed to `origin/main`.
- [ ] GitHub repository is public.
- [ ] GitHub Actions verification passes on the latest commit.
- [ ] Vercel dispatcher deployment points to the latest commit.
- [ ] Vercel driver deployment points to the latest commit.
- [ ] Dispatcher production login works with Google.
- [ ] Driver production login works with Google.
- [ ] Dispatcher shows seeded demo data.
- [ ] Driver shows available, booked, completed, and suggested-next flow.
- [ ] No real secrets are committed.

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
