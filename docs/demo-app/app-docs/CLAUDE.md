---
name: Demo App Docs — Claude Context
description: Claude instructions for the demo-app/app-docs folder — explains the HTML prototype purpose, structure, and how to use it as a design reference.
---

# iPrep Demo App — Claude Context

> This folder contains a fully interactive HTML/CSS/JS prototype of the iPrep platform.
> It serves as a Figma-style design reference — all screens, mock data, and simulated API calls —
> so UX can be validated before the real React/Express app is built.

---

## Project Layout

| Folder        | Status              | Notes                                                                     |
| ------------- | ------------------- | ------------------------------------------------------------------------- |
| `demo-app/`   | ✅ Complete (v1)    | Original prototype — 7 views, all features working                        |
| `demo-app-2/` | 🔄 In Progress (v2) | Rebuilt from spec (`02-feature.md`) — 3 of 4 files done, `app.js` missing |
| `app-docs/`   | —                   | This file, plan docs, feature specs                                       |

---

## demo-app-2 — Build Status

Generated from spec: `app-docs/02-feature.md`

| File             | Status     | Lines | Notes                                                                                                            |
| ---------------- | ---------- | ----- | ---------------------------------------------------------------------------------------------------------------- |
| `index.html`     | ✅ Done    | 129   | Full shell, all 7 nav routes, sidebar, toast container                                                           |
| `style.css`      | ✅ Done    | 1893  | Full design system, dark/light tokens, all component classes                                                     |
| `mock-data.json` | ✅ Done    | 746   | Tutors, packages, 6+ sessions w/ transcripts, analysis, fileSystem, communicationAnalysis, lifetimeCommunication |
| `app.js`         | ❌ Missing | —     | Router, MockAPI, State, all 9 view renderers — **next step**                                                     |

### Routes in demo-app-2

`#dashboard` · `#new-interview` · `#session` · `#analysis` · `#history` · `#chat` · `#files` · `#communication` · `#settings`

---

## What This Is

A zero-build, single-file SPA (no bundler, no framework) that runs directly in a browser via `file://`.
Open `index.html` to use it.

**Purpose:** Design reference + stakeholder demo for the iPrep AI Interview Coaching platform.
**Stack:** Vanilla HTML + CSS Custom Properties + Vanilla JS. No dependencies except Google Fonts (CDN).

---

## demo-app (v1) — Files

| File             | Lines | Purpose                                                                        |
| ---------------- | ----- | ------------------------------------------------------------------------------ |
| `index.html`     | ~85   | SPA shell — sidebar, main content area, toast container                        |
| `style.css`      | ~1400 | Full design system + all component + view styles                               |
| `app.js`         | ~1100 | Router, MockAPI, State, all view renderers, AI chat engine                     |
| `mock-data.json` | ~540  | All mock data — tutors, packages, sessions, analysis, providers, conversations |
| `CLAUDE.md`      | —     | This file                                                                      |

---

## Architecture

### State (global singleton)

```js
const State = {
  currentView,
  selectedPackage,
  selectedTutor,
  wizardStep,
  activeSessionId,
  sessionTimer,
  sessionSeconds,
  sessionMicOn,
  transcriptInterval,
  transcriptIndex,
  settingsTab,
  historyFilter,
  theme, // 'dark' | 'light' — persisted to localStorage
  currentConvId, // active chat conversation ID
  data, // loaded from mock-data.json
};
```

### MockAPI (Promise-based, 200–800ms artificial delay)

Methods: `load()`, `getTutors()`, `getPackages()`, `getSessions()`, `getAnalysis(id)`,
`getProviders()`, `getStats()`, `startSession()`, `endSession()`,
`getConversations()`, `getConversation(id)`, `createConversation()`, `addMessage()`

### Router (hash-based)

`navigate(view, params)` → clears timers → updates State → calls `renderView()` → updates nav active state → sets `window.location.hash`

Views registered in `viewMap`: `dashboard`, `new-interview`, `session`, `analysis`, `history`, `settings`, `chat`

---

## Views — Completion Status

| View              | Route            | Status      | Notes                                                                            |
| ----------------- | ---------------- | ----------- | -------------------------------------------------------------------------------- |
| Dashboard         | `#dashboard`     | ✅ Complete | Stats grid, quick-start, recent sessions, tip/streak widgets                     |
| New Interview     | `#new-interview` | ✅ Complete | 2-step wizard — package select → tutor select → start                            |
| Interview Session | `#session`       | ✅ Complete | Live timer, waveform animation, transcript feed, mic toggle                      |
| Analysis Results  | `#analysis`      | ✅ Complete | Animated score rings, strengths/improvements, accordion feedback, full report    |
| History           | `#history`       | ✅ Complete | Search, 7 filter chips, table with hover actions                                 |
| Settings          | `#settings`      | ✅ Complete | 3 tabs: Providers, API Keys, Preferences                                         |
| AI Chat           | `#chat`          | ✅ Complete | Two-panel layout, conversation list, AI engine, typing indicator, action buttons |

---

## Features Implemented

### Light / Dark Mode

- Toggled via sidebar button (☀️/🌙) or Settings → Preferences → Dark Theme toggle
- CSS: dark values in `:root`, light overrides in `[data-theme="light"]`
- Persisted to `localStorage` key `iprep-theme`
- Score ring SVG track color adapts to theme in `scoreRing()` JS function

### AI Chat Engine (`getAIResponse()`)

Keyword-based intent matching with 11 patterns. All responses reference real mock data:

- `last session / recent / how did I do` → pulls latest completed session + analysis scores
- `improve / weakness / focus` → aggregates improvements across last 3 sessions
- `stats / progress / streak` → pulls from `stats` object
- `new interview / start session` → ROI-ranked session recommendations
- `dsa / algorithm / leetcode` → DSA-specific feedback + 7-day plan
- `behavioral / star method` → behavioral performance + drills
- `system design / architecture` → Morgan's 3 gap areas
- `hr / salary / culture fit` → HR round feedback
- `alex / priya / morgan` → tutor-specific info + session record
- Default → capability overview with suggestion actions

Markdown formatter `formatAIText()`: XSS-safe, handles `**bold**`, `*italic*`, bullet lists, numbered lists, paragraph breaks.

Action buttons in AI messages use `window._chatActions` registry (keyed by random ID) to avoid `JSON.stringify` in `onclick` attributes.

### Session Timer Cleanup

`clearSessionTimers()` is called by `navigate()` to prevent `setInterval` leaks when leaving the session view.

---

## Mock Data Summary (`mock-data.json`)

```
tutors[]          3 tutors — Alex (Technical/DSA), Priya (Behavioral/HR), Morgan (System Design/PM — Pro)
packages[]        6 packages — behavioral, technical, dsa, hr, pm (Pro), system-design (Pro)
sessions[]        8 sessions with real timestamps, durations, scores, analysisIds
analysis{}        3 detailed analysis objects (anal_001–003) with scores, strengths, improvements,
                  answer-by-answer feedback, full markdown report
providers[]       8 providers ordered by fallback chain priority
stats{}           totalSessions, completedSessions, avgScore, bestCategory, studyStreakDays, totalMinutes
transcript_demo[] 7 transcript lines for the live session mock
conversations[]   3 seed conversations (conv_001–003) covering behavioral review, DSA strategy, system design
```

---

## Design System (CSS Custom Properties)

```css
/* Dark (default in :root) */
--bg-primary: #07070f /* page background */ --bg-surface: #0d0d1f /* card / sidebar background */
  --bg-elevated: #141428 /* elevated card */ --bg-border: #1c1c38 /* borders */ --bg-hover: #1a1a32
  /* hover state */ --card-bg: rgba(13, 13, 31, 0.8) /* glass card (uses backdrop-filter) */
  --accent-purple: #7c3aed --accent-blue: #3b82f6
  --accent-grad: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%) --text-primary: #f1f5f9
  --text-secondary: #cbd5e1 --text-muted: #64748b --text-faint: #334155 --success: #10b981
  --warning: #f59e0b --error: #ef4444;
```

Light mode overrides all `--bg-*` and `--text-*` under `[data-theme="light"]`.

---

## Key Patterns & Conventions

- **Global functions on `window`**: view-specific handlers (`selectPackage`, `toggleMic`, `sendChatMessage`, etc.) are attached to `window` inside render functions so inline `onclick` attributes work
- **`window._chatActions` registry**: chat action buttons store action objects by random ID to avoid serialization issues in onclick strings
- **Async render functions**: all `render*()` functions are `async`, call MockAPI, then set `innerHTML`
- **`view-enter` animation**: `renderView()` adds this class after render completes for a fade-in effect
- **No external JS dependencies**: everything is vanilla — no React, no jQuery, no Tailwind

---

## What Could Be Added Next

- [ ] Delete conversation button in chat sidebar
- [ ] Conversation rename (double-click title)
- [ ] Export analysis to PDF (mock download)
- [ ] Onboarding flow (first-time user modal)
- [ ] Mobile responsive layout (sidebar collapses to bottom nav)
- [ ] Notification / reminder widget on dashboard
- [ ] Interview countdown timer on dashboard ("Your next session in X days")
- [ ] Package detail modal (click package card → see all topics + sample questions)
- [ ] Score trend chart on dashboard (sparkline showing score over last 8 sessions)
