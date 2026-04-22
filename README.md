# 🔥 21Days+ — Discipline Blocks

> **Build lasting habits through locked, time-bound discipline blocks.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-181717?style=for-the-badge&logo=github)](https://thrishankkuntimaddi.github.io/21Days-)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

---

## 📌 Description

**21Days+** is a productivity PWA built around the philosophy that meaningful habit change requires focused, committed, time-bound sprints — called **Discipline Blocks**. Inspired by the popular "21-day habit formation" principle, the app lets you define a block of days, set a custom list of **DO** and **DON'T** habits, lock them in, and track your daily execution — one checkbox at a time.

### The Problem It Solves

Most habit trackers are too flexible — you can edit your habits anytime, skip days guilt-free, or abandon goals without accountability. 21Days+ takes a different approach: **once a block is created, the tasks are permanently locked until completion**. This enforced commitment mirrors real-world discipline and creates genuine psychological pressure to follow through.

### Why It Exists

It exists as a personal accountability tool for anyone who wants to:
- Break bad habits by tracking DON'T items alongside DO items
- Maintain streaks across multiple parallel discipline tracks
- Visualize progress through heatmaps and analytics
- Have a lightweight, offline-capable app that doesn't get in the way

---

## 🚀 Live Demo

**🌐 [https://thrishankkuntimaddi.github.io/21Days-](https://thrishankkuntimaddi.github.io/21Days-)**

Deployed on **GitHub Pages** via `gh-pages`. The app is fully installable as a PWA on mobile and desktop.

> **Tip:** On mobile, tap **"Add to Home Screen"** for a native-like full-screen experience.

---

## 🔐 Login / Demo Credentials

21Days+ uses **Firebase Email/Password Authentication**. There are no shared guest accounts — each user's data is fully isolated in Firestore under their own UID.

To try the app:
1. Visit the live demo link
2. Click **Sign Up** and register with any email and password (min. 6 characters)
3. Your data is private and persists across sessions and devices

---

## 🧩 Features

### Core
- 🔒 **Locked Discipline Blocks** — Tasks are immutable once a block is created, enforcing commitment
- ✅ / 🚫 **Dual Task Types** — Define habits to build (DO) and habits to break (DON'T) within the same block
- 📅 **Flexible Block Duration** — Set any duration from 1 to 365 days (default: 21 days)
- 📊 **Daily Tracking Grid** — A visual matrix of all tasks × all days with one-click toggling

### Analytics
- 🔥 **Current & Longest Streak** — Tracks consecutive perfect days in real-time
- 📈 **Overall Success %** — Aggregated completion rate across all past days
- 📉 **Stats Panel** — Per-block breakdown of total days, perfect days, and daily percentages
- 🗺️ **Heatmap Chart** — Visual calendar-style heatmap of daily performance intensity

### Data & Account
- 💾 **Export Data** — Download a full JSON backup of all blocks and daily logs
- 📥 **Import Data** — Restore from a previously exported backup (merges with existing data)
- 🔄 **Block Duplication** — Clone a completed block to restart the same routine from today
- ➕ **Block Extension** — Add more days to a completed block to keep momentum going
- 🗑️ **Block & Data Deletion** — Delete individual blocks or reset all data from Settings

### UX & Design
- 🌙 **Dark / Light Mode Toggle** — Persistent theme preference via React Context
- 📱 **Fully Responsive** — Adaptive layout with desktop Sidebar + mobile Bottom Navigation
- 🔔 **Toast Notifications** — Real-time feedback on all save, delete, and auth actions
- ⚡ **PWA Installable** — Offline-ready via Workbox service worker with auto-update support
- 🗒️ **Daily Notes** — Per-day reflection journal entries attached to any block

### Developer Quality
- 🛡️ **Error Boundary** — Graceful fallback UI for runtime crashes
- 🔍 **Malformed Doc Filtering** — Firestore queries defensively filter invalid block documents
- 📄 **Paginated Mobile Grid** — 7-day windowed view on mobile to avoid horizontal overflow

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 8 |
| **Language** | TypeScript 6 |
| **Routing** | React Router DOM v7 |
| **Backend / Auth** | Firebase Authentication (Email/Password) |
| **Database** | Cloud Firestore (NoSQL, real-time) |
| **State Management** | React Context API (`AuthContext`, `ThemeContext`) |
| **Date Utilities** | date-fns v4 |
| **Icons** | Lucide React |
| **Notifications** | react-hot-toast |
| **PWA** | vite-plugin-pwa + Workbox |
| **Deployment** | GitHub Pages via gh-pages |
| **Styling** | Vanilla CSS (component-scoped) |
| **Linting** | ESLint 9 + typescript-eslint |

---

## 📂 Project Structure

```
21Days+/
├── public/
│   ├── manifest.json          # PWA web app manifest
│   ├── favicon.svg            # App icon
│   ├── icons.svg              # Sprite sheet for UI icons
│   └── 404.html               # GitHub Pages SPA fallback
├── src/
│   ├── main.tsx               # App entry point (BrowserRouter, providers)
│   ├── App.tsx                # Route definitions + auth gate
│   ├── firebase.ts            # Firebase SDK initialization (auth + db)
│   ├── types.ts               # Core TypeScript interfaces (Block, Task, DayLog, BlockStats)
│   ├── utils.ts               # Pure business logic (stats, streak calc, date helpers)
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Firebase auth state (user, loading)
│   │   └── ThemeContext.tsx    # Dark/light mode toggle with localStorage persistence
│   │
│   ├── services/
│   │   └── firestore.ts       # All Firestore CRUD: blocks, logs, export, import, reset
│   │
│   ├── pages/
│   │   ├── AuthPage.tsx        # Login + Sign-up form
│   │   ├── DashboardPage.tsx   # Block list with stats overview and filter tabs
│   │   ├── BlockPage.tsx       # Block detail: tracking grid, stats, actions
│   │   └── SettingsPage.tsx    # Profile, data management, password update, theme
│   │
│   └── components/
│       ├── BlockCard.tsx        # Dashboard card: mini progress bar + streak badge
│       ├── CreateBlockModal.tsx # Full modal: title, date, duration, DO/DON'T tasks
│       ├── TrackingGrid.tsx     # Task × Day matrix with toggling + notes
│       ├── StatsPanel.tsx       # Detailed stats breakdown panel
│       ├── HeatmapChart.tsx     # Calendar-style daily completion heatmap
│       ├── Sidebar.tsx          # Desktop left nav with user info
│       ├── BottomNav.tsx        # Mobile bottom tab bar
│       ├── Spinner.tsx          # Reusable loading spinner
│       └── ErrorBoundary.tsx    # React error boundary fallback
│
├── vite.config.ts             # Vite config with PWA + Workbox setup
├── tsconfig.app.json          # TypeScript config for app code
└── package.json               # Scripts and dependencies
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- A Firebase project with **Authentication** (Email/Password) and **Firestore** enabled

### 1. Clone the Repository

```bash
git clone https://github.com/thrishankkuntimaddi/21Days-.git
cd 21Days-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Replace the Firebase config in `src/firebase.ts` with your own project credentials:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

> ⚠️ For production use, move these values to a `.env` file (see Environment Variables below).

### 4. Run Locally

```bash
npm run dev
```

App will be available at **http://localhost:3000**

### 5. Build for Production

```bash
npm run build
```

### 6. Deploy to GitHub Pages

```bash
npm run deploy
```

---

## 🔑 Environment Variables

For production, Firebase credentials should be stored in a `.env` file at the project root. Create `.env` and update `src/firebase.ts` to read from `import.meta.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project identifier |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID (optional) |

> Add `.env` to `.gitignore` to keep credentials out of version control.

---

## 🧠 How It Works

### Data Model

```
Firestore
└── users/{userId}
    └── blocks/{blockId}           ← Block document (title, startDate, duration, tasks[], locked)
        └── logs/{date}            ← DayLog document per day (completions{taskId: bool}, note)
```

Each user owns their own subtree. There are no cross-user reads.

### Core Logic Flow

1. **Authentication** — `AuthContext` wraps the app with `onAuthStateChanged`. Unauthenticated users see only `AuthPage`.

2. **Block Creation** — `CreateBlockModal` collects title, start date, duration, and a split list of DO / DON'T tasks. On submit, `createBlock()` writes to Firestore with `locked: true`. The task list is permanently frozen.

3. **Real-Time Sync** — `subscribeBlocks()` and `subscribeLogs()` use Firestore's `onSnapshot` to keep the UI live. Multiple blocks' logs are subscribed in parallel and merged into a `logsMap` keyed by `blockId`.

4. **Task Toggling** — Each cell in the `TrackingGrid` calls `toggleTask()`, which upserts the `completions` field on the day's log document. Future days are blocked from being toggled.

5. **Stats Computation** — `computeBlockStats()` in `utils.ts` is a pure function. It iterates all block dates up to today, calculates per-day completion percentage, accumulates streaks, and returns a `BlockStats` object. This runs client-side on every render — no backend aggregation needed.

6. **Completion Handling** — `isBlockCompleted()` checks if today is past the block's end date. Completed blocks show a post-completion panel offering: **Extend** (add days), **Duplicate** (clone with new start date), or **Delete**.

7. **PWA / Offline** — Workbox (via `vite-plugin-pwa`) pre-caches all static assets and Google Fonts. The service worker auto-updates on new deployments (`registerType: 'autoUpdate'`).

---

## 🚧 Challenges & Solutions

| Challenge | Solution |
|---|---|
| **Firestore subcollection orphans** — Firestore doesn't auto-delete subcollections when a parent document is deleted | On block delete, logs are explicitly fetched and batch-deleted before the parent block is removed |
| **Malformed Firestore documents** — Incomplete documents (e.g., mid-write crashes) could cause JS errors in the UI | `subscribeBlocks()` filters out any document missing required fields (`startDate`, `duration`, `tasks`) before passing to state |
| **Mobile grid overflow** — A 21-column tracking grid breaks on small screens | A paginated 7-day windowed view (`MOBILE_PAGE = 7`) is rendered on mobile using CSS `mobile-only` / `desktop-only` display toggling |
| **GitHub Pages SPA routing** — Navigating directly to `/block/:id` returns a 404 on GitHub Pages | A `404.html` redirect script catches unknown paths and rewrites them to the SPA root with the path preserved in query params |
| **Re-authentication for password change** — Firebase requires recent sign-in before sensitive operations | `reauthenticateWithCredential()` is called with the user's current password before `updatePassword()` |
| **Streak calculation accuracy** — Streaks should not count future days or partially completed days | `computeBlockStats()` breaks the loop when `date > today` and only counts a day as perfect if completion is exactly 100% |

---

## 🔮 Future Improvements

- 📲 **Push Notifications** — Daily reminders via Web Push API to log tasks before midnight
- 🤝 **Social Accountability** — Share a read-only block link with a friend or accountability partner
- 🏷️ **Block Categories & Tags** — Organize blocks by area (health, work, learning, etc.)
- 📊 **Cross-Block Analytics** — Aggregate dashboard showing lifetime streaks, best month, and success trend
- 🔢 **Quantitative Tasks** — Support for numeric goals (e.g., "Walk 10,000 steps") alongside boolean checkboxes
- 🌍 **Timezone-Aware Logging** — Explicit timezone anchoring to prevent edge cases around midnight
- ☁️ **Cloud Functions** — Server-side aggregation for heavy analytics as data grows
- 🧪 **Unit Tests** — Test coverage for `utils.ts` stat functions using Vitest

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the existing code style (TypeScript strict, component-scoped CSS)
4. **Test locally**: `npm run dev`
5. **Lint your code**: `npm run lint`
6. **Commit** with a descriptive message: `git commit -m "feat: add push notification support"`
7. **Open a Pull Request** against the `main` branch

### Code Style Guidelines
- Prefer functional React components with hooks
- Keep business logic in `utils.ts` as pure functions
- All Firestore operations belong in `src/services/firestore.ts`
- Component CSS lives in a co-located `.css` file

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Thrishank Kuntimaddi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <strong>🔥 21Days+ · Build discipline. One block at a time.</strong><br/>
  <sub>v1.0.0 · Monolith</sub>
</div>
