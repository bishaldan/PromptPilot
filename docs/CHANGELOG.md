# Changelog

All notable changes to the AI Auto Teaching Hub are documented here.

Format: `## [version] — YYYY-MM-DD`

---

## [v1.2.0] — 2026-02-22

### 🎨 White & Orange UI Overhaul

- **New Homepage** — professional landing page with hero section, features grid, how-it-works steps, testimonials, CTA banner, and footer
- **New About Page** (`/about`) — mission statement, core values (4 cards), team section, CTA
- **Complete CSS Redesign** — switched from dark navy/blue to white background + orange accents (850+ lines rewritten)
- **Accessibility Improvements** — 18px body font, 48px min touch targets, WCAG AA focus rings
- **Centered Auth Cards** — login and register pages now use a clean centered card layout
- **Generated Illustrations** — hero image (diverse learners) and about image (team collaboration)
- **Navbar Update** — added "About" link, updated for light theme

### Files Changed

- `src/app/globals.css` — complete rewrite
- `src/app/page.tsx` — new landing page
- `src/app/about/page.tsx` — new page
- `src/app/login/page.tsx` — redesigned
- `src/app/register/page.tsx` — redesigned
- `src/components/Navbar.tsx` — about link, light theme
- `public/images/hero.png` — new
- `public/images/about.png` — new

---

## [v1.1.0] — 2026-02-22

### 🐛 Bug Fixes

- **Cookie Name Mismatch** — login/register set `session_token` but API routes (`/api/me`, `/api/me/stats`, `admin-guard.ts`) were reading `session`. Fixed all to `session_token`
- **Navbar Hooks Violation** — early return before `useEffect` broke React. Moved public-page check after all hooks
- **Profile Page Crash** — `split()` on null `displayName` caused TypeError. Added `|| "U"` fallback
- **Navbar Data Mapping** — was reading `data.email` but progress API returns `data.user.email`. Fixed to read nested `data.user`

### Files Changed

- `src/app/api/me/route.ts`
- `src/app/api/me/stats/route.ts`
- `src/lib/admin-guard.ts`
- `src/components/Navbar.tsx`
- `src/app/profile/page.tsx`

---

## [v1.0.0] — 2026-02-22

### 🚀 Full Product Overhaul (6 Phases)

#### Phase 1: Multi-Tool Data Model

- Upgraded Prisma schema with `LessonDifficulty` enum, user profile fields (`displayName`, `avatarUrl`, `role`), and tool metadata

#### Phase 2: Universal Seed System

- Created `data/tools.json` for tool definitions
- Rewrote `prisma/seed.ts` with auto-discovery of lesson JSON files
- Default admin user creation (`admin@aiteach.hub`)

#### Phase 3: User Profile & Settings

- **Navbar** — persistent nav with user avatar dropdown, admin link
- **Profile Page** — editable display name, stats grid (lessons, badges, completion rate, steps)
- **API Routes** — `/api/me` GET/PATCH for profile, `/api/me/stats` for aggregated stats

#### Phase 4: Professional Dashboard

- Multi-tool filter chips, search, difficulty badges (Beginner/Intermediate/Advanced)
- Progress bars, contextual buttons (Start/Continue/Review)
- Stats overview (total lessons, completed, in progress, tools)

#### Phase 5: Admin Panel

- Role-based admin guard middleware
- Overview tab (global stats, tools list)
- Users tab (search, user management table)
- API routes for platform analytics

#### Phase 6: Onboarding & Polish

- **Welcome Page** — post-registration onboarding with feature cards and CTA
- **Registration** — added `displayName` field
- **CSS** — 460+ lines for all new components, glassmorphism dark theme

### Files Added/Modified (20+)

- Schema, seed, tools config
- Dashboard, profile, admin, welcome pages
- Navbar component
- API routes (me, me/stats, me/progress, admin/stats, admin/users)
- Admin guard middleware
- Global CSS

---

## [v0.1.0] — 2026-02-20

### 🌱 Initial Release

- Basic lesson runner with Chrome extension integration
- Single-tool support (Google Gemini)
- Login/register authentication with JWT
- Simple lesson list dashboard
- Step verification via extension telemetry
- Docker Compose setup (Next.js + MariaDB)
