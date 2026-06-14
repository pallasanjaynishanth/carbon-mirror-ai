# 🌍 CarbonMirror AI

**See The Hidden Impact Of Your Everyday Choices.**

> Built for **PromptWars Challenge 3** — Carbon Awareness, Behavioral Change, Contextual Storytelling, Gamification, Social Accountability, and Personalized Insights.

CarbonMirror AI is **not a carbon calculator**. It's a behavioral change engine that turns abstract emission numbers into visceral, human-scale stories — paired with a living digital ecosystem that reacts to your choices in real time.

---

## ✨ Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Carbon Reality Engine** | Converts `280kg CO₂` into "14 trees absorbing carbon for a year" — beautiful awareness cards with AI-generated contextual equivalents. |
| 2 | **AI Carbon Storyteller** | Gemini generates personalized weekly narratives about your emission patterns, with actionable, specific tips. |
| 3 | **Earth Avatar** | A living ecosystem (forests, rivers, wildlife) that thrives or degrades based on your weekly carbon footprint — animated with Framer Motion. |
| 4 | **Future Simulator** | Side-by-side 1/6/12-month projections: "Current Lifestyle" vs "Sustainable Lifestyle," with CO₂, trees, and money saved. |
| 5 | **Receipt & Bill Scanner** | Upload grocery bills, fuel receipts, or electricity bills. Gemini Vision extracts items, estimates emissions, and scores sustainability. |
| 6 | **Community Challenges** | Join "No Car Week," "Green Commute Month," etc. Real leaderboards built from activity data. |
| 7 | **Achievements** | Gamified badges: Eco Beginner → Carbon Reducer → Climate Hero → Green Champion → Planet Guardian. |
| 8 | **Personal Dashboard** | Carbon Score, Awareness Score, weekly trends, category breakdowns, and AI recommendations — all in a premium glassmorphic UI. |

---

## 🏗️ Architecture

### Product Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js 15)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Dashboard │  │  Avatar  │  │Simulator │  │ Scanner  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       └─────────────┴─────────────┴─────────────┘        │
│                       │                                    │
│              ┌────────▼─────────┐                         │
│              │  AuthProvider     │  (Firebase Auth)        │
│              │  ThemeProvider    │                         │
│              └────────┬─────────┘                         │
└───────────────────────┼───────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
┌───────▼────────┐              ┌─────────▼─────────┐
│  Firestore DB   │              │  Next.js API Routes │
│  (Client SDK)   │              │  (Server / Admin)   │
└─────────────────┘              └─────────┬───────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │   Gemini AI / Vision│
                                  │  - Stories          │
                                  │  - Equivalents      │
                                  │  - Simulations      │
                                  │  - Receipt analysis │
                                  │  - Behavior analysis│
                                  └─────────────────────┘
```

### Feature Architecture

- **Carbon Engine** (`/features/carbon-engine`): Pure calculation functions — emission factors, equivalents, severity, avatar health, carbon score.
- **AI Layer** (`/ai/gemini.ts`): All Gemini prompts and JSON-structured responses, with graceful fallbacks to static calculations.
- **Services** (`/services`): Firestore CRUD abstractions, kept separate from UI components.
- **Components**: `cards/` (feature cards), `charts/` (Recharts visualizations), `layout/` (shell, sidebar, providers), `ui/` (shadcn primitives).

### Database Schema (Firestore Collections)

```
users/{uid}
  - displayName, email, photoURL
  - carbonScore, awarenessScore, level, totalCo2Kg, streak
  - preferences { theme, notifications, weeklyReport, timezone, country }
  - stats { weeklyAvgCo2, monthlyAvgCo2, activitiesLogged, ... }

activities/{id}
  - userId, category, label, co2Kg, amount, unit, date
  - createdAt, updatedAt

stories/{id}            -- AI-generated, server-write-only
  - userId, weekStart, narrative, topCategory, totalCo2Kg
  - reductionPct, tips[], mood, generatedAt

simulations/{id}
  - userId, name, timeframe, currentPath, sustainablePath

receipts/{id}
  - userId, type, extractedItems[], totalCo2Kg
  - sustainabilityScore, suggestions[], rawText, processedAt

teams/{id}
  - name, description, creatorId, memberIds[], totalCo2Kg

challenges/{id}
  - title, description, type, targetReductionPct
  - startDate, endDate, participantIds[], leaderboard[], status

leaderboards/{id}        -- server-write-only

achievements/{uid}        -- server-write-only
  - unlocked[]: AchievementId[]

reports/{id}              -- server-write-only
  - userId, headline, body, highlight, nextWeekGoal, behavior, createdAt
```

### User Flow

```
Landing → Sign up / Sign in
  → Dashboard (overview: score, story, avatar, trend, achievements)
    → Log Activity (Carbon Reality Engine → Reality Card → Save)
    → Earth Avatar (ecosystem visualization, timeline)
    → Future Simulator (1m/6m/12m, current vs sustainable)
    → Receipt Scanner (upload → Gemini Vision → breakdown + suggestions)
    → Challenges (browse / create / join → leaderboard)
    → Achievements (progress tracking, badges)
    → Settings (profile, theme, notifications)
```

### Folder Structure

```
carbonmirror-ai/
├── app/
│   ├── (app)/                  # Authenticated app shell
│   │   ├── layout.tsx          # Sidebar + auth guard
│   │   ├── dashboard/
│   │   ├── avatar/
│   │   ├── reality/
│   │   ├── simulator/
│   │   ├── scanner/
│   │   ├── challenges/
│   │   ├── achievements/
│   │   └── settings/
│   ├── api/
│   │   ├── activities/route.ts
│   │   ├── stories/route.ts
│   │   ├── simulate/route.ts
│   │   ├── scan/route.ts
│   │   ├── reports/route.ts
│   │   ├── achievements/route.ts
│   │   └── challenges/route.ts
│   ├── auth/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                # Landing page
│   ├── globals.css
│   ├── manifest.ts
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── cards/                  # RealityCard, WeeklyStoryCard, ActivityFeed, ...
│   ├── charts/                 # CarbonScoreRing, CategoryBreakdown, WeeklyTrendChart
│   └── layout/                 # AppSidebar, AuthProvider, ThemeProvider
├── features/
│   └── carbon-engine/
│       └── calculations.ts     # Emission factors, equivalents, scores
├── services/
│   └── activityService.ts      # Firestore CRUD
├── hooks/
│   └── useActivities.ts
├── ai/
│   └── gemini.ts                # All Gemini prompts
├── animations/
│   └── variants.ts              # Framer Motion variants
├── firebase/
│   ├── client.ts
│   └── admin.ts
├── lib/
│   └── utils.ts
├── types/
│   └── index.ts
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env.example
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### API Structure

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/activities` | POST | Generate AI-powered carbon equivalents (with static fallback) |
| `/api/stories` | POST | Generate weekly AI carbon story, persisted to Firestore |
| `/api/simulate` | POST | Generate 1/6/12-month emission forecasts (current vs sustainable) |
| `/api/scan` | POST | Gemini Vision receipt/bill analysis |
| `/api/reports` | POST / GET | Generate & fetch weekly AI reports + behavior analysis |
| `/api/achievements` | POST / GET | Check & persist unlocked achievements |
| `/api/challenges` | GET | Compute challenge leaderboard from activity data |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Firebase Authentication, Firestore
- **AI**: Google Gemini API (text + vision)
- **Charts**: Recharts
- **Deployment**: Vercel-ready

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd carbonmirror-ai
npm install
```

### 2. Set Up Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password + Google provider)
3. Create a **Firestore Database** (production mode)
4. Deploy security rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
5. Generate a service account key (Project Settings → Service Accounts → Generate new private key) for the Admin SDK variables.

### 3. Get a Gemini API Key

Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and create an API key.

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in all Firebase client/admin values and your `GEMINI_API_KEY`.

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deployment (Vercel)

1. Push your repo to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Add all environment variables from `.env.example` in **Project Settings → Environment Variables**.
   - For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the key including `\n` newline escapes — Vercel handles this correctly as a string.
4. Deploy. Vercel will auto-detect Next.js 15 and configure the build.

### Build Command
```bash
npm run build
```

### Production Checklist

- [ ] Firestore rules deployed (`firestore.rules`)
- [ ] Firestore indexes deployed (`firestore.indexes.json`)
- [ ] Firebase Auth providers enabled (Email/Password, Google)
- [ ] Gemini API key has sufficient quota
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Lighthouse audit run (target: 90+ across Performance, Accessibility, Best Practices, SEO)

---

## 🎨 Design Philosophy

CarbonMirror AI's UI draws from **Apple, Notion, Linear, and Stripe** — minimalist, glassmorphic, with smooth Framer Motion transitions, full dark/light mode support, and mobile-first responsive layouts. Every number is paired with an emotional, human-scale story rather than a sterile statistic.

---

## 🧠 AI Prompting Strategy

All Gemini calls in `/ai/gemini.ts` return **strict JSON** with explicit schemas, parsed defensively with fallbacks to static calculation logic (`/features/carbon-engine/calculations.ts`) — ensuring the app degrades gracefully if the AI is unavailable or rate-limited.

---

## 📄 License

Built for PromptWars Challenge 3. MIT License.
