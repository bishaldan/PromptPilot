# Security Policy

## Supported versions

PromptPilot is currently maintained on the latest `main` branch. Security fixes are applied there first.

## Reporting a vulnerability

Please do not open public GitHub issues for security reports.

Use one of these private channels instead:

- GitHub Security Advisories for this repository
- The maintainer contact email listed on the GitHub profile or repository

Include:

- A short description of the issue
- Steps to reproduce
- Expected impact
- Any proof-of-concept details that help verify the report

We will aim to acknowledge valid reports quickly and coordinate a fix before public disclosure.

## Security practices in this repository

- Secrets are expected through environment variables, not committed files.
- The seed script does not create a default admin account unless `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are provided.
- Telemetry is intentionally limited to step-verification metadata such as event type, selector identifier, URL hash, and input-length bucket.
- Prompt text and model response text are not stored.
