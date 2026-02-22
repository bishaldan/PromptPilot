# AI Auto Teaching Hub - Full Documentation

## 1. Product Overview
AI Auto Teaching Hub is a Gemini-first training platform that teaches users how to use AI tools with guided, verified, real-time steps.

Core behavior:
- User signs up and logs in.
- User accepts monitoring consent.
- User chooses a lesson and starts a lesson run.
- Web app sends a signed lesson token to Chrome extension.
- Extension monitors only required step actions on Gemini pages.
- Backend validates step completion in strict order.
- Progress is saved and a badge is awarded when lesson completes.

## 2. MVP Scope
In scope:
- Individual learners
- Email/password auth
- Consent gate
- Gemini lesson catalog
- Strict step lock
- Extension highlight + event reporting
- Progress + badge tracking
- Gemini feature-tour lesson (`+`, Tools, model selector)

Out of scope:
- Multi-tool curriculum beyond Gemini
- Team/classroom management
- Certificates
- AI-generated lesson authoring

## 3. Architecture
Main components:
- React frontend (Next.js App Router)
- Next.js API routes backend
- Prisma ORM
- MariaDB
- Chrome Extension (Manifest V3)

Runtime flow:
1. User starts lesson via web app.
2. Backend creates `LessonRun` and returns signed `lessonRunToken` (30 min).
3. Web app sends `CONNECT_LESSON` message to extension.
4. Extension validates token through backend.
5. Extension receives run state and highlights current selector in Gemini.
6. Extension emits step events.
7. Backend stores telemetry event and advances only when current step rule is satisfied.

## 4. Repository Structure
- `src/app` - Next.js pages and API routes
- `src/lib` - auth/token/crypto/runtime helpers
- `src/types` - shared TypeScript contracts
- `prisma/schema.prisma` - database schema
- `prisma/seed.ts` - data seeding
- `data/lessons/gemini-lessons.json` - authored lesson content
- `extension/` - Chrome extension source
- `tests/` - Vitest unit tests
- `docker-compose.yml` - Docker runtime
- `Dockerfile` - web container image

## 5. Environment Variables
Required app variables:
- `DATABASE_URL`
- `AUTH_SECRET`
- `LESSON_TOKEN_SECRET`
- `POLICY_VERSION`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL` (optional, keep empty for same-origin `/api`)

Notes:
- Use different strong values for `AUTH_SECRET` and `LESSON_TOKEN_SECRET`.
- Web-to-extension messaging now works automatically through a localhost content-script bridge.

## 6. Setup And Run
### 6.1 Local Node.js
1. `npm install`
2. `npm run prisma:generate`
3. `npm run prisma:push`
4. `npm run seed`
5. `npm run dev`

### 6.2 Docker
1. `docker compose up -d --build`
2. Open `http://localhost:3000`

Docker ports:
- Web: `3000`
- MariaDB host mapping: `3307 -> 3306`

## 7. Chrome Extension Setup
1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select `extension/`
5. Reload extension after updates
6. Restart app (or Docker stack) if needed

## 8. Lesson Content Model
Seed file: `data/lessons/gemini-lessons.json`

Lesson shape:
- `id`, `tool`, `title`, `description`
- `steps[]`

Step shape:
- `id`, `order`, `instruction`
- `urlPattern`
- `targetSelectors[]`
- `actionType`: `navigate | click | input | wait_for_response`
- `completionRule`: `element_visible | clicked_target | input_detected | response_detected`
- `allowManualConfirm`

## 9. Database Model
Main tables:
- `User`
- `Consent`
- `Tool`
- `Lesson`
- `LessonStep`
- `LessonRun`
- `LessonRunStep`
- `TelemetryEvent`
- `BadgeAward`

Key behaviors:
- One consent record per `(userId, policyVersion)`.
- Each run contains one status row per lesson step.
- First run step is `ACTIVE`; all others start `LOCKED`.
- Badge is unique per `(userId, lessonId)`.

## 10. API Contracts
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

Request:
```json
{ "email": "user@example.com", "password": "Password123!" }
```

### Consent
- `POST /api/consent/accept`

### Tools and Lessons
- `GET /api/tools`
- `GET /api/tools/:toolId/lessons`

### Lesson Runs
- `POST /api/lesson-runs/start`
- `GET /api/lesson-runs/:runId`
- `POST /api/lesson-runs/:runId/events`
- `POST /api/lesson-runs/:runId/complete-step`
- `POST /api/lesson-runs/:runId/finish`

### Progress
- `GET /api/me/progress`

### Extension Endpoints
- `POST /api/extension/connect`
- `GET /api/extension/run-state`

## 11. Extension Message Protocol
Web app -> extension:
```ts
{
  type: "CONNECT_LESSON";
  lessonRunToken: string;
}
```

Content script -> background:
```ts
{
  type: "STEP_EVENT";
  stepId: string;
  eventType: "ELEMENT_FOUND" | "CLICK" | "INPUT_ACTIVITY" | "RESPONSE_VISIBLE";
  url: string;
  timestamp: string;
  meta?: {
    selectorId?: string;
    inputLengthBucket?: "0" | "1-20" | "21-100" | "100+";
  };
}
```

## 12. Privacy And Data Handling
Stored telemetry fields:
- event type
- selector identifier
- input length bucket
- URL hash

Not stored:
- prompt text
- model response text

Consent requirements:
- Lesson start is blocked until policy acceptance exists for current `POLICY_VERSION`.

## 13. Step Progression Rules
Strict step lock:
- Only current `ACTIVE` step may complete.
- Events for out-of-order steps are rejected.
- Completion advances the next `LOCKED` step to `ACTIVE`.
- Final step completion marks run `COMPLETED` and awards badge.

Manual fallback:
- If `allowManualConfirm` is true for current step, user can manually confirm from web UI.

## 14. Tests
Current tests:
- `tests/lesson-engine.test.ts`
- `tests/tokens.test.ts`

Run:
- `npm run test`
- `npm run lint`

Docker run:
- `docker compose exec web npm run test`
- `docker compose exec web npm run lint`

## 15. Troubleshooting
Docker web container not starting:
- Run `docker compose logs web`
- Ensure Docker daemon is running
- Rebuild image: `docker compose up -d --build`

Port conflict:
- If host 3306 is occupied, use mapped port 3307 (already configured).

Extension not connecting:
- Ensure extension is loaded and enabled
- Reload extension from `chrome://extensions` after code changes
- Ensure app URL is `http://localhost:3000`
- Check extension popup status and browser console

Database issues:
- Re-apply schema: `npm run prisma:push`
- Re-seed lessons: `npm run seed`

## 16. Security Notes
- Replace default secrets before shared usage.
- Keep this MVP internal/local only.
- Move to signed HTTPS origins before production usage.
- Add rate limiting and audit logging for public deployment.

## 17. Current Status
Implemented and verified:
- Dockerized stack boots (`web` + `db`)
- Prisma schema applied and seed executed automatically in container
- Auth, consent, lesson start, and extension connect APIs working
- Lint and tests pass

Remaining for broader release:
- Production deployment hardening
- Multi-tool support beyond Gemini
- Admin lesson editor UI
