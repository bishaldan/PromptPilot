<div align="center">

# ✦ AI Auto Teaching Hub

### Learn AI Tools Through Guided, Interactive Practice

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<br />

_A free, accessible learning platform that teaches anyone — from students to seniors — how to use AI tools like Google Gemini through step-by-step, verified lessons._

<br />

[Getting Started](#-getting-started) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure) · [Screenshots](#-screenshots) · [Contributing](#-contributing)

</div>

---

## 🎯 The Problem

Most AI tutorials are written for technical audiences. They assume programming knowledge and leave beginners behind. We built AI Auto Teaching Hub to change that.

## 💡 The Solution

An interactive learning platform where **anyone** can sit down and start learning AI tools immediately through:

- **Step-by-step guided lessons** that walk you through real AI tasks
- **Real-time verification** via a Chrome extension that confirms each step
- **A warm, accessible UI** designed so even your grandparents can use it

---

## ✨ Features

| Feature                    | Description                                                                           |
| :------------------------- | :------------------------------------------------------------------------------------ |
| 📚 **Interactive Lessons** | Follow guided steps on the actual AI tool. Each step is verified in real time.        |
| 🏆 **Badges & Progress**   | Earn badges as you complete lessons. Track your learning journey with detailed stats. |
| 🤖 **Multiple AI Tools**   | Currently supports Google Gemini. More tools coming soon.                             |
| 👤 **User Profiles**       | Editable display name, avatar, and comprehensive stats dashboard.                     |
| 🛡️ **Admin Panel**         | Platform overview, user management, lesson analytics for administrators.              |
| ♿ **Accessibility First** | 18px font, 48px touch targets, high contrast, focus rings — designed for all ages.    |
| 🆓 **100% Free**           | No paywall, no premium tier. Education should be free.                                |

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [Git](https://git-scm.com/)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/bishaldan/AI-auto-teaching-hub.git
cd AI-auto-teaching-hub

# 2. Create your environment file
cp .env.example .env
# Edit .env with your settings (or use defaults for development)

# 3. Start the application
docker compose up --build -d

# 4. Open in your browser
open http://localhost:3000
```

### Default Admin Account

| Field    | Value               |
| :------- | :------------------ |
| Email    | `admin@aiteach.hub` |
| Password | `AdminPass123!`     |

---

## 🛠️ Tech Stack

| Layer              | Technology                                                        |
| :----------------- | :---------------------------------------------------------------- |
| **Frontend**       | Next.js 14 (App Router), React 18, TypeScript                     |
| **Styling**        | Vanilla CSS — white & orange theme, mobile responsive             |
| **Backend**        | Next.js API Routes                                                |
| **Database**       | PostgreSQL 16 + Prisma ORM                                        |
| **Authentication** | JWT sessions via `session_token` cookie                           |
| **Deployment**     | Docker Compose (web + database)                                   |
| **Extension**      | Chrome companion extension for step verification                  |
| **Font**           | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) |

---

## 📁 Project Structure

```
ai-auto-teaching-hub/
│
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Landing page (homepage)
│   │   ├── about/page.tsx          # About Us
│   │   ├── login/page.tsx          # Authentication
│   │   ├── register/page.tsx       # Registration
│   │   ├── welcome/page.tsx        # Post-registration onboarding
│   │   ├── dashboard/page.tsx      # Learning dashboard
│   │   ├── profile/page.tsx        # User profile & stats
│   │   ├── admin/page.tsx          # Admin panel
│   │   ├── lessons/[slug]/page.tsx # Lesson runner
│   │   └── api/                    # REST API routes
│   │       ├── auth/               # Login, register, logout
│   │       ├── me/                 # User profile, stats, progress
│   │       └── admin/              # Admin analytics
│   │
│   ├── components/                 # Shared React components
│   │   └── Navbar.tsx              # Persistent navigation bar
│   │
│   └── lib/                        # Utilities
│       ├── tokens.ts               # JWT token management
│       ├── admin-guard.ts          # Role-based access control
│       ├── api-client.ts           # Frontend fetch helper
│       └── http.ts                 # HTTP utilities
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Auto-discovery lesson seeder
│
├── data/
│   ├── tools.json                  # AI tool definitions
│   └── lessons/                    # Lesson JSON files
│       └── gemini/                 # Google Gemini lessons
│
├── public/images/                  # Static assets
├── docs/                           # Documentation
│   ├── PROJECT.md                  # Project overview
│   └── CHANGELOG.md                # Version history
│
├── docker-compose.yml              # Container orchestration
├── Dockerfile                      # App container build
└── package.json                    # Dependencies
```

---

## 📸 Screenshots

### Landing Page

A welcoming homepage with hero section, feature cards, testimonials, and call-to-action.

### Learning Dashboard

Filter lessons by tool and difficulty. Track progress with stats and progress bars.

### Profile & Stats

View your learning statistics — lessons completed, badges earned, completion rate.

### Admin Panel

Platform overview with user management and lesson analytics.

---

## 📖 How It Works

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. Sign Up  │───▶│ 2. Pick a    │───▶│ 3. Practice  │
│              │    │    Lesson     │    │    & Learn    │
│ Free account │    │ Browse by    │    │ Follow steps │
│ in < 1 min   │    │ tool & level │    │ on actual AI │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ Chrome Extension  │
                                    │ verifies each     │
                                    │ step in real time │
                                    └──────────────────┘
```

1. **Create an account** — just name, email, and password
2. **Pick a lesson** — browse by AI tool and difficulty level
3. **Practice on the AI tool** — the platform guides you step by step
4. **Get verified** — a Chrome extension confirms you completed each step correctly
5. **Earn badges** — complete lessons to earn badges and track progress

---

## 🧪 Development

### Running Without Docker

```bash
# Install dependencies
npm install

# Set up database (requires PostgreSQL)
npx prisma generate
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev
```

### Environment Variables

| Variable              | Description                  | Default                 |
| :-------------------- | :--------------------------- | :---------------------- |
| `DATABASE_URL`        | PostgreSQL connection string | Set in docker-compose   |
| `AUTH_SECRET`         | JWT signing secret           | Set in .env             |
| `NEXT_PUBLIC_APP_URL` | Application URL              | `http://localhost:3000` |

---

## 📋 Changelog

See [docs/CHANGELOG.md](docs/CHANGELOG.md) for a complete version history.

**Latest: v1.2.0** — White & orange UI overhaul, new homepage & about page, accessibility improvements.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ to make AI education accessible for everyone.**

[⬆ Back to Top](#-ai-auto-teaching-hub)

</div>
