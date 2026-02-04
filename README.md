<img width="826" height="463" alt="image" src="https://github.com/user-attachments/assets/0578e6c6-7f80-475b-a9b6-c121d8444d75" />


# TalkMCA

**AI-Powered Sales Call Training Platform**

Practice and perfect your sales skills with realistic AI-powered conversations. Get instant feedback, track your progress, and climb the leaderboards.

---

## Overview

TalkMCA is a cutting-edge training platform that leverages Google's Gemini 2.5 AI to simulate realistic sales calls. Whether you're a new advisor looking to build confidence or a seasoned professional wanting to sharpen your skills, TalkMCA provides a safe, engaging environment to practice handling any sales scenario.

### Why TalkMCA?

- **Realistic Practice** - AI personas respond naturally, with distinct personalities and objection styles
- **Instant Feedback** - Get scored on 5 key sales metrics immediately after each call
- **Gamified Learning** - Earn XP, unlock achievements, and compete on leaderboards
- **No Pressure** - Practice difficult conversations without risking real deals
- **Team Learning** - See how your colleagues perform and learn from their calls

---

## Features

### For Sales Advisors

| Feature | Description |
|---------|-------------|
| **AI Sales Calls** | Real-time voice conversations with AI prospects using Gemini 2.5 Live |
| **20+ Personas** | Pre-built prospects like "Skeptical Steve" and "Busy Barbara" at varying difficulty levels |
| **Dynamic Prospects** | Generate unique AI personas on-the-fly for unlimited practice scenarios |
| **Instant Scoring** | AI evaluates your performance on tone, product knowledge, objection handling, rapport, and closing |
| **Progress Tracking** | Monitor your XP, level progression, and call history |
| **Achievements** | Unlock badges for milestones like first call, perfect scores, and call streaks |
| **Leaderboards** | Compete with colleagues across XP, call count, total time, and average scores |
| **Team Feed** | View team activity, react to calls, and leave encouraging comments |

### For Administrators

| Feature | Description |
|---------|-------------|
| **Analytics Dashboard** | Track weekly/monthly call stats, top performers, and usage trends |
| **Call Review Queue** | Listen to and provide feedback on advisor calls |
| **Persona Management** | Create, edit, and manage AI prospect personas |
| **User Management** | Manage team members, roles, and permissions |

### AI & Gamification

- **29 AI Voices** - Diverse voice options for realistic persona variety
- **5-Criteria Scoring** - Comprehensive evaluation with weighted metrics
- **25 Level System** - Progress from "Rookie" to "Sales Immortal"
- **20+ Achievements** - Unlock badges for various accomplishments
- **Combined Recording** - Captures both user and AI audio for review

---

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn/ui** - Beautiful, accessible components
- **Zustand** - Lightweight state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with Row Level Security
- **JWT Authentication** - Secure session management
- **Resend** - Transactional email service

### AI Integration
- **Google Gemini 2.5 Live** - Real-time voice AI via WebSocket
- **Web Audio API** - Audio processing and recording

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- [Supabase](https://supabase.com) account
- [Google AI Studio](https://aistudio.google.com) account (for Gemini API)
- [Resend](https://resend.com) account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jaicedev/ai-call-trainer.git
   cd ai-call-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Google Gemini AI
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # Authentication
   JWT_SECRET=your_secure_jwt_secret

   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up the database**

   In your Supabase SQL Editor, run these scripts in order:
   ```bash
   # 1. Main schema
   supabase/schema.sql

   # 2. Seed data (personas)
   supabase/seed.sql

   # 3. Migrations (in supabase/migrations/)
   20260204_add_dynamic_persona_columns.sql
   20260204_add_gamification.sql
   20260204_add_mock_business_details.sql
   20260204_add_user_roles.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
ai-call-trainer/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Authentication pages
│   │   │   ├── login/            # Login page
│   │   │   ├── verify/           # Email verification
│   │   │   └── setup/            # Password setup
│   │   ├── (dashboard)/          # Protected user pages
│   │   │   ├── page.tsx          # Team feed (home)
│   │   │   ├── achievements/     # User achievements
│   │   │   ├── history/          # Call history
│   │   │   ├── leaderboard/      # Rankings
│   │   │   └── settings/         # User settings
│   │   ├── (admin)/              # Admin section
│   │   │   └── admin/
│   │   │       ├── page.tsx      # Analytics dashboard
│   │   │       ├── personas/     # Persona management
│   │   │       ├── users/        # User management
│   │   │       └── review-queue/ # Call review
│   │   ├── api/                  # API endpoints
│   │   └── call/[id]/            # Call page
│   ├── components/
│   │   ├── call/                 # Call interface components
│   │   ├── feed/                 # Social feed components
│   │   ├── gamification/         # XP, achievements, leaderboards
│   │   ├── layout/               # Navigation, sidebar
│   │   └── ui/                   # Shadcn/ui primitives
│   ├── hooks/
│   │   ├── use-gemini-live.ts    # Gemini WebSocket hook
│   │   └── use-dial-tone.ts      # Audio effects
│   ├── lib/
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── db.ts                 # Database operations
│   │   ├── dynamic-persona.ts    # AI persona generation
│   │   ├── email.ts              # Email service
│   │   ├── gamification.ts       # XP & achievements logic
│   │   └── supabase/             # Supabase client
│   ├── stores/
│   │   └── call-store.ts         # Call state management
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   └── middleware.ts             # Auth middleware
├── supabase/
│   ├── schema.sql                # Database schema
│   ├── seed.sql                  # Initial data
│   └── migrations/               # Schema migrations
├── public/                       # Static assets
└── package.json
```

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-code` | POST | Send verification code to email |
| `/api/auth/verify-code` | POST | Verify email code |
| `/api/auth/setup-password` | POST | Set initial password |
| `/api/auth/login` | POST | Login with email/password |
| `/api/auth/logout` | POST | Logout and clear session |
| `/api/auth/me` | GET | Get current user |

### Calls

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calls/start` | POST | Start a new call |
| `/api/calls/end` | POST | End call and trigger scoring |
| `/api/calls/history` | GET | Get user's call history |
| `/api/calls/[id]` | GET | Get specific call details |
| `/api/calls/[id]/notes` | PATCH | Update call notes |

### Gamification

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/achievements` | GET | Get user achievements |
| `/api/user/stats` | GET | Get user XP and level |
| `/api/leaderboard` | GET | Get leaderboard data |

### Social

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/feed` | GET | Get team activity feed |
| `/api/feed/comments` | POST | Add comment to call |
| `/api/feed/reactions` | POST | React to a call |

### Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/analytics` | GET | Dashboard statistics |
| `/api/admin/review-queue` | GET | Unreviewed calls |
| `/api/admin/review-queue/[id]` | POST | Submit call review |
| `/api/admin/personas` | GET/POST | List/create personas |
| `/api/admin/users` | GET | List all users |

---

## Gamification System

### Leveling

Progress through 25 levels, each with a unique title:

| Level | Title | Level | Title |
|-------|-------|-------|-------|
| 1 | Rookie | 14 | Sales Warrior |
| 2 | Beginner | 15 | Revenue Hunter |
| 3 | Novice | 16 | Deal Dominator |
| 4 | Apprentice | 17 | Quota Crusher |
| 5 | Junior Rep | 18 | Pipeline King |
| 6 | Sales Rep | 19 | Closing Machine |
| 7 | Senior Rep | 20 | Sales Virtuoso |
| 8 | Closer | 21 | Revenue Royalty |
| 9 | Top Closer | 22 | Sales Champion |
| 10 | Deal Maker | 23 | Elite Performer |
| 11 | Negotiator | 24 | Sales Legend |
| 12 | Persuader | 25 | Sales Immortal |
| 13 | Sales Expert | | |

### XP Calculation

- **Base XP**: 25 per call
- **Difficulty Multiplier**: 1.0x to 1.4x based on persona difficulty
- **Score Bonus**: Up to 20 XP based on average score
- **Completion Bonus**: 5 XP for completing calls over 30 seconds

### Scoring Criteria

Each call is scored 1-10 on five metrics:

1. **Tone** - Professional, confident, and empathetic communication
2. **Product Knowledge** - Understanding and articulating product benefits
3. **Objection Handling** - Addressing concerns effectively
4. **Rapport Building** - Creating connection with the prospect
5. **Closing Technique** - Moving toward commitment appropriately

---

## Database Schema

### Core Tables

- **users** - User accounts with roles and gamification stats
- **personas** - AI prospect configurations
- **calls** - Call records with transcripts and scores
- **call_scores** - Detailed scoring on 5 criteria
- **call_reviews** - Admin feedback on calls
- **feed_comments** - User comments on calls
- **feed_reactions** - Emoji reactions (fire, clap, lightbulb, star)

### Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Email domain validation
- Secure, httpOnly cookies

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Yes | Gemini API key (client) |
| `GEMINI_API_KEY` | Yes | Gemini API key (server) |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `RESEND_API_KEY` | Yes | Resend email API key |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For issues and feature requests, please open an issue on GitHub.

---

<p align="center">
  <strong>TalkMCA</strong> - Practice makes perfect. Start your first call today.
</p>
