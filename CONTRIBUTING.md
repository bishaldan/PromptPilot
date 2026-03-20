# Contributing to PromptPilot

Thanks for contributing. PromptPilot aims to stay approachable for beginners while keeping the codebase clean and production-minded.

## Development setup

1. Fork the repository and clone your fork.
2. Copy `.env.example` to `.env`.
3. Start the stack with `docker compose up --build`.
4. Load the extension from `/extension` in `chrome://extensions`.

For local Node.js development without Docker:

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Branching and pull requests

1. Create a focused branch from `main`.
2. Keep changes scoped to one feature or fix.
3. Include tests or a clear rationale when tests are not practical.
4. Update docs when behavior, architecture, or setup changes.
5. Open a pull request with a concise summary and validation notes.

## Quality checks

Run these before opening a pull request:

```bash
npm run lint
npm run test
npm run build
```

If you are using Docker:

```bash
docker compose exec web npm run lint
docker compose exec web npm run test
docker compose exec web npm run build
```

## Coding guidelines

- Prefer small, well-named modules over large files.
- Keep telemetry privacy-safe. Do not store prompt text or model response text.
- Preserve accessibility defaults: large targets, clear labels, visible focus states.
- Avoid adding environment-specific hostnames, secrets, or credentials to source control.
- If you add a lesson, keep selectors resilient and document special matcher behavior when needed.

## Security

If you discover a security issue, do not open a public issue. Follow the process in `SECURITY.md`.
