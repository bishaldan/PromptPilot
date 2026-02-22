# AI Auto Teaching Hub

## What Is This?

AI Auto Teaching Hub is a **free, interactive learning platform** that teaches people how to use AI tools like Google Gemini through guided, step-by-step lessons. Each lesson walks you through real tasks on the actual AI tool, verifying every step so you learn by doing — not just reading.

The platform is designed to be **accessible for everyone**, including elderly users and complete beginners with no technical background.

---

## Who Is It For?

- 🎓 **Students** — learn AI tools to boost academic and career skills
- 👩‍💼 **Professionals** — stay current with the latest AI capabilities
- 👴 **Seniors** — discover AI at your own pace with a friendly, easy-to-use interface
- 🧑‍🏫 **Educators** — use the platform to teach AI literacy in classrooms

---

## Core Features

| Feature                 | Description                                                      |
| :---------------------- | :--------------------------------------------------------------- |
| **Interactive Lessons** | Step-by-step guides verified in real time via a Chrome extension |
| **Multiple AI Tools**   | Currently supports Google Gemini, with more tools planned        |
| **Badges & Progress**   | Earn badges as you complete lessons; track your learning journey |
| **User Profiles**       | Editable display name, stats dashboard, progress tracking        |
| **Admin Panel**         | Platform overview, user management, lesson analytics             |
| **Accessibility**       | 18px font, large touch targets, high contrast white/orange theme |

---

## Tech Stack

| Layer            | Technology                                 |
| :--------------- | :----------------------------------------- |
| Frontend         | Next.js 14 (App Router), React, TypeScript |
| Styling          | Vanilla CSS (white & orange theme)         |
| Backend          | Next.js API Routes                         |
| Database         | PostgreSQL + Prisma ORM                    |
| Auth             | JWT sessions via `session_token` cookie    |
| Deployment       | Docker Compose (web + db)                  |
| Chrome Extension | Companion extension for step verification  |
| Font             | Outfit (Google Fonts)                      |

---

## Project Structure

```
ai-auto-teaching-hub/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx            # Landing page (homepage)
│   │   ├── about/              # About Us page
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── welcome/            # Post-registration onboarding
│   │   ├── dashboard/          # Main learning dashboard
│   │   ├── profile/            # User profile & stats
│   │   ├── admin/              # Admin panel
│   │   ├── lessons/            # Lesson runner
│   │   ├── consent/            # Extension consent flow
│   │   └── api/                # API routes
│   ├── components/             # Reusable components (Navbar)
│   └── lib/                    # Utilities (auth, tokens, admin-guard)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeder
├── data/
│   ├── tools.json              # AI tool definitions
│   └── lessons/                # Lesson JSON files
├── public/images/              # Hero & about illustrations
├── docs/                       # Project documentation
├── docker-compose.yml          # Docker orchestration
└── Dockerfile                  # Container build
```

---

## How to Run

```bash
# Start the app (requires Docker)
docker compose up --build -d

# Access at http://localhost:3000

# Default admin account:
# Email: admin@aiteach.hub
# Password: AdminPass123!
```

---

## Design Philosophy

1. **Accessibility First** — large text, clear labels, generous spacing
2. **White & Orange** — warm, welcoming color palette
3. **Learning by Doing** — every lesson has verified hands-on practice
4. **Free Forever** — no paywall, no premium tier
