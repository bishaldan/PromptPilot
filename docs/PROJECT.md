# PromptPilot

PromptPilot is an interactive AI-learning product that teaches real workflows inside real AI tools. The platform guides learners step by step, verifies progress through a Chrome extension bridge, and keeps the experience beginner-friendly and privacy-conscious.

## Intended audience

- students learning practical AI literacy
- professionals building tool fluency
- educators introducing AI in guided settings
- beginners and older learners who need a calmer, more accessible experience

## What makes it different

- lessons happen inside the real tool, not a sandbox imitation
- progress advances only when the current step is actually completed
- the interface uses large type, clear spacing, visible focus states, and warm visual design
- telemetry is minimal and avoids storing prompt or response text

## Stack summary

- Next.js App Router
- React + TypeScript
- Prisma + MariaDB
- Manifest V3 Chrome extension
- Docker Compose for local orchestration

## Current product capabilities

- interactive lesson catalog
- lesson-run state tracking
- consent gate for monitored verification
- badges and learner progress
- admin dashboard and user stats
- Gemini-first guided lessons with extension-assisted verification

## Local run

```bash
cp .env.example .env
docker compose up --build
```

Optional admin bootstrap during seed:

```bash
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=use-a-long-unique-password
```

## Related docs

- `README.md`
- `DOC.md`
- `docs/CHANGELOG.md`
- `SECURITY.md`
