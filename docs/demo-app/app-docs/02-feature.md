---
name: Demo App Feature Specification
description: Feature specification details for the iPrep demo app — screens, interactions, and component breakdown for the prototype.
---

# iPrep Demo App - Feature Specification

Use this single file as the source of truth to generate a fresh vanilla web app from scratch.

Generate these files:

- `index.html`
- `style.css`
- `app.js`
- `mock-data.json`

Do not copy the existing visual design. Do not treat this as a styling brief. Use your own design judgment for layout, colors, spacing, typography, and polish. The requirements below describe what the app does, what data it needs, and how the user flows work.

## Product Summary

iPrep is a mock interview practice app. A user can choose an interview package, choose an AI tutor, run a simulated interview session, review past sessions, inspect analysis reports, chat with an AI coach, manage prep files, and review communication feedback such as filler words and sentence rewrites.

The app is a front-end only prototype. All data comes from `mock-data.json`. All create/update/delete actions should mutate in-memory state only. No backend, authentication, real audio, real file persistence, or real AI calls are required.

## Technical Requirements

- Build with plain HTML, CSS, and JavaScript.
- No framework and no build step.
- `index.html` loads `style.css`, `app.js`, and bootstraps the app.
- `app.js` fetches `mock-data.json` on load.
- Use hash routing such as `#dashboard`, `#new-interview`, `#session`, `#analysis`, `#history`, `#chat`, `#files`, `#communication`, `#settings`.
- Keep app state in a single JavaScript state object.
- Show toast messages for simulated actions.
- The UI must work from the generated files in a static web server.

## Core Data Model

`mock-data.json` should include these top-level keys:

- `tutors`
- `packages`
- `sessions`
- `analysis`
- `providers`
- `stats`
- `transcript_demo`
- `conversations`
- `fileSystem`

### Tutors

Each tutor:

- `slug`
- `name`
- `initials`
- `color`
- `specialty`
- `personality`: array of short strings
- `description`
- `voice`
- `isPro`
- `sessionCount`
- `avgScore`

Minimum tutors:

- Alex: technical, DSA, direct
- Priya: behavioral, HR, supportive
- Morgan: system design, product, strategic, pro tutor

### Packages

Each interview package:

- `slug`
- `name`
- `type`
- `icon`
- `difficulty`
- `duration`
- `description`
- `topics`
- `questionCount`
- `isPro`

Minimum packages:

- Behavioral
- Technical
- DSA
- HR Round
- Product Manager
- System Design

### Sessions

Each session:

- `id`
- `packageSlug`
- `packageName`
- `tutorSlug`
- `tutorName`
- `status`: `COMPLETED`, `ACTIVE`, or `ABANDONED`
- `mode`: usually `VOICE`
- `startedAt`
- `endedAt`
- `durationSec`
- `score`
- `analysisId`
- `hasRecording`
- `recordingUrl`
- `recordingDurationSec`
- `transcript`: array of transcript turns

Each transcript turn:

- `speaker`: `ai` or `user`
- `text`
- `timestampSec`

Include at least 6 sessions. Most should be completed and have recording/transcript data. At least one should be abandoned and have no recording.

### Analysis

The `analysis` object is keyed by analysis id.

Each analysis:

- `id`
- `sessionId`
- `provider`
- `status`
- `scores`
- `strengths`
- `improvements`
- `answerFeedback`
- `report`
- `generatedAt`
- optional `communicationAnalysis`

Scores:

- `communication`
- `technical`
- `problemSolving`
- `confidence`
- `overall`

Each answer feedback item:

- `question`
- `userAnswer`
- `feedback`
- `score`

### Communication Analysis

Each `communicationAnalysis`:

- `sessionId`
- `analyzedAt`
- `totalUserWords`
- `totalUserTurns`
- `overallCommunicationScore`
- `fillerWordStats`
- `topReplacements`
- `sentenceRewrites`
- `strengthsInCommunication`

Each filler stat:

- `word`
- `count`
- `percentOfTotal`
- `severity`: `low`, `medium`, or `high`

Each replacement:

- `original`
- `betterAlternatives`
- `exampleInContext`

Each sentence rewrite:

- `original`
- `rewritten`
- `improvement`

### Stats

Include:

- `totalSessions`
- `completedSessions`
- `avgScore`
- `bestCategory`
- `bestScore`
- `studyStreakDays`
- `totalMinutes`
- `lifetimeCommunication`

`lifetimeCommunication`:

- `avgCommunicationScore`
- `totalFillerWordsAllTime`
- `topFillerAllTime`
- `improvementTrend`
- `mostImprovedArea`
- `nextFocusArea`
- `allTimeFillerStats`
- `recentSessionScores`

### Conversations

Each conversation:

- `id`
- `title`
- `createdAt`
- `updatedAt`
- `messages`

Each message:

- `id`
- `role`: `user` or `ai`
- `text`
- `ts`
- `actions`: optional quick actions

Each action:

- `label`
- `view`: optional route name to navigate to
- `params`: optional route params
- `trigger`: optional text to send as a new user message

### File System

`fileSystem`:

- `storageRoot`
- `folders`
- `rootFiles`

Each folder:

- `id`
- `name`
- `createdAt`
- `files`

Each file:

- `id`
- `name`
- `type`: `md`, `pdf`, or `docx`
- `sizeKB`
- `createdAt`
- `updatedAt`
- `content`: markdown string for `md`; `null` for `pdf` and `docx`
- `folderId`

Include at least:

- one folder containing markdown prep notes
- one folder containing uploaded PDF files
- one root markdown file

## App Shell

The app should have persistent navigation that lets users open:

- Dashboard
- New Interview
- AI Chat
- History
- Files
- Communication
- Settings

The active route should be visible to the user. Navigation should update `window.location.hash`.

## Feature 1: Dashboard

Purpose: give the user a quick overview and entry point.

Dashboard must show:

- greeting or page title
- total sessions
- average score
- best category
- study streak
- quick action to start a new interview
- recent completed sessions
- a short practice tip
- quick stats such as total practice time and sessions this week

Interactions:

- Clicking start interview navigates to `#new-interview`.
- Clicking a recent session opens its analysis if an `analysisId` exists.
- View all sessions navigates to `#history`.

## Feature 2: New Interview Wizard

Purpose: let the user configure and start a mock interview.

Wizard steps:

1. Choose package.
2. Choose tutor.
3. Review selection and start.

Behavior:

- The user cannot proceed without choosing the required item for the current step.
- Package cards/rows show package name, difficulty, duration, topic count, and whether it is pro.
- Tutor cards/rows show tutor name, specialty, personality, average score, session count, and whether it is pro.
- The review step summarizes selected package, tutor, estimated duration, mode, and expected question count.
- Starting creates a simulated active session id and navigates to `#session`.

## Feature 3: Live Session Simulation

Purpose: simulate an active voice interview.

Session view must show:

- selected package and tutor
- elapsed timer
- mic on/off toggle
- live transcript
- button to end the session

Behavior:

- The timer starts when the view opens.
- Transcript turns from `transcript_demo` appear one at a time on an interval.
- Mic toggle changes local state only.
- End session stops timers, simulates completion, shows progress/success toasts, then navigates to `#analysis` using an existing analysis id.
- After ending a session, simulate a background communication analysis job:
  - after a short delay show a toast that communication patterns are being analyzed
  - after another delay show a toast that communication analysis is ready
  - the ready toast or action should navigate to analysis or communication details if implemented

## Feature 4: Analysis View

Purpose: review the result of one completed session.

Analysis view must show:

- overall score
- score breakdown
- provider and generation status
- strengths
- improvements
- per-answer feedback
- markdown-like report
- communication analysis tab or section when data exists

Behavior:

- Route can accept an analysis id through params/state; default to the latest available analysis if none is provided.
- Score breakdown should include communication, technical, problem solving, confidence, and overall.
- Answer feedback should be expandable or otherwise easy to scan.
- The report should render markdown-like content, at minimum headings, bold text, lists, and paragraphs.
- If `communicationAnalysis` exists, show:
  - communication score
  - total words and turns
  - filler word counts
  - replacement suggestions
  - sentence rewrites
  - communication strengths

## Feature 5: History With Recordings And Transcripts

Purpose: make past sessions reviewable.

History view must show:

- filters for all/completed/abandoned sessions
- list of sessions with package, tutor, date, duration, status, and score
- action to open analysis when available
- action to open recording when `hasRecording` is true
- action to open transcript when transcript data exists

Behavior:

- Filtering updates the visible sessions.
- Only one session detail panel should be open at a time.
- Opening recording shows a simulated recording player:
  - title/context
  - current time and duration
  - progress indicator
  - playback controls
  - speed choices
  - export/download action
- Recording controls do not need real audio; clicking them should show a toast saying playback is simulated.
- Export/download should show a toast with a realistic saved file message.
- Opening transcript shows all transcript turns with timestamp, speaker, and text.
- Transcript search filters matching turns in real time.
- Transcript download/export should show a toast with a realistic saved file message.

## Feature 6: AI Chat Coach

Purpose: let the user ask for coaching based on mock data.

Chat view must show:

- conversation list
- selected conversation
- message history
- message input
- quick action buttons from AI messages
- new conversation action

Behavior:

- Existing conversations load from `mock-data.json`.
- Selecting a conversation shows its messages.
- Sending a user message appends it immediately.
- A simulated AI response appears after a short delay.
- New conversation creates a conversation in memory with a useful initial AI message.
- Action buttons either navigate to another view or send their `trigger` text as a user message.

Minimum AI response patterns:

- If user asks about last session, summarize latest completed session and link to its analysis.
- If user asks what to improve or practice next, list prioritized improvement areas from recent analyses.
- If user asks about DSA, mention DSA patterns and link to a relevant analysis/session.
- If user asks about system design, mention gaps such as rate limiting, cache eviction, and observability.
- If user asks about communication, filler words, `um`, `like`, or `basically`, summarize top fillers from latest communication analysis and link to `#communication`.
- If user asks to rewrite, express, articulate, or use professional words, provide one sentence rewrite from latest communication analysis.
- Otherwise return a general coaching response with relevant next actions.

## Feature 7: Files And Markdown Notes

Purpose: let the user manage prep notes and uploaded documents.

Files view must show:

- file tree with folders and root files
- editor/viewer area
- actions for new markdown file, new folder, and upload
- storage root from mock data

Behavior:

- Folders can expand/collapse.
- Selecting a markdown file opens an editor.
- Markdown editor has edit and preview modes.
- Edit mode uses a textarea.
- Preview mode renders simple markdown.
- Save writes content back to in-memory `State.data.fileSystem`.
- Auto-save can be simulated after a delay while typing.
- Creating a markdown file adds it to selected folder or root.
- Creating a folder adds an empty folder.
- Upload accepts `.md`, `.pdf`, and `.docx` in the UI, then adds a mock file record in memory.
- Selecting PDF/DOCX shows a read-only placeholder/viewer with metadata and a note that preview is simulated.
- Delete file removes it from memory.
- Delete folder removes the folder and its files from memory.
- Rename and move can be included as optional mock actions; if included, mutate memory only.

## Feature 8: Communication Coach

Purpose: aggregate communication quality across sessions.

Communication view must show:

- average communication score
- total filler words
- analyzed session count
- top filler word
- score trend over recent sessions
- all-time filler word stats
- professional replacement reference
- focus area for this week
- recent session communication scores

Behavior:

- Data comes from `stats.lifetimeCommunication`.
- Filler stats should show word, count, severity, and better alternatives when available.
- Focus area should use `nextFocusArea` and top filler data.
- Recent session rows should navigate to analysis for that session when possible.
- A start practice action should navigate to `#new-interview`.

## Feature 9: Settings

Purpose: configure mock providers and preferences.

Settings view must include:

- Providers tab/section
- API Keys tab/section
- Preferences tab/section

Providers:

- Show provider name, type, status, version if available, note, and install hint if available.

API keys:

- Include fields for Deepgram, Anthropic/Claude, Gemini, and OpenAI.
- Values are mock/local only.
- Allow show/hide password fields.
- Save shows a toast.

Preferences:

- Default tutor
- Default package
- Voice mode toggle
- Auto-analyze on end toggle
- Theme toggle if implemented
- Save shows a toast

## Required Helper Behavior

Implement helpers as needed for:

- formatting dates
- formatting durations
- formatting transcript timestamps
- choosing score status labels/classes
- rendering simple markdown
- showing toasts
- navigating by route
- clearing live session timers
- finding latest completed session
- finding analysis by session id
- getting all files from file system

## Suggested App State

Use a state object with fields similar to:

- `currentView`
- `selectedPackage`
- `selectedTutor`
- `wizardStep`
- `activeSessionId`
- `sessionTimer`
- `sessionSeconds`
- `sessionMicOn`
- `transcriptInterval`
- `transcriptIndex`
- `settingsTab`
- `historyFilter`
- `expandedHistoryRow`
- `expandedHistoryPanel`
- `selectedFileId`
- `editorMode`
- `expandedFolders`
- `fileModal`
- `filesAutoSaveTimer`
- `currentConvId`
- `data`

Exact names can differ, but the behavior should match this spec.

## Acceptance Criteria

The generated app is complete when:

- It loads mock data successfully.
- Every route in the navigation renders a meaningful view.
- New interview can be configured and started.
- Session simulation shows a timer and live transcript.
- Ending a session navigates to analysis and shows simulated analysis toasts.
- Analysis renders scores, feedback, report, and communication data.
- History supports filtering, recording panel, transcript panel, and transcript search.
- Chat supports conversation selection, sending messages, simulated AI replies, and quick actions.
- Files supports folder expansion, file selection, markdown editing, preview, save, create, upload, and delete in memory.
- Communication view aggregates lifetime communication stats.
- Settings shows providers, API key fields, and preferences.
- No action requires a backend.
- The generated app remains usable after route changes and repeated interactions.

## Important Non-Goals

Do not implement:

- real authentication
- real audio playback or recording
- real speech-to-text
- real AI provider calls
- real local file system writes
- real PDF/DOCX rendering
- server-side persistence
- payment/pro subscription enforcement

Pro labels are informational only in this prototype.
