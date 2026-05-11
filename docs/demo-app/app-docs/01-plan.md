# Demo App — Feature Plan 01

> Plan for three new feature areas to add to the iPrep demo app prototype.
> All features are scoped to the vanilla HTML/CSS/JS SPA (`docs/demo-app/`).
> Coding convention: type-only interfaces in new views; no bundler, no framework.

---

## Features Overview

| #   | Feature                                       | New Route                             | Touches Existing                                      |
| --- | --------------------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| 1   | Interview Recordings & Transcripts in History | none (extends `#history`)             | `renderHistory`, `mock-data.json`, `style.css`        |
| 2   | File Manager + Markdown Editor                | `#files`                              | sidebar nav, `viewMap`, `mock-data.json`              |
| 3   | Communication Analysis & Suggestions          | `#communication` + post-session panel | `renderAnalysis`, `mock-data.json`, `getAIResponse()` |

---

## Feature 1 — Recordings & Transcripts in History

### Goal

Expand the existing History table so each past session row is expandable. When opened it reveals: a playback-style audio player (mock), a full scrollable transcript, and a download button. This makes History a meaningful review tool, not just a list.

### Mock Data Changes (`mock-data.json`)

Add these fields to each object in `sessions[]`:

```json
{
  "hasRecording": true,
  "recordingUrl": "mock://recordings/sess_001.mp3",
  "recordingDurationSec": 1847,
  "transcript": [
    {
      "speaker": "ai",
      "text": "Tell me about a time you led a cross-functional team.",
      "timestampSec": 12
    },
    {
      "speaker": "user",
      "text": "Yeah so basically I was the lead on this project and um we had like five teams involved...",
      "timestampSec": 18
    }
  ]
}
```

Add a `recordings` section to capture storage metadata (used by File Manager later):

```json
"recordings": {
  "storageRoot": "~/.iprep/recordings/",
  "totalCount": 8,
  "totalSizeMB": 142.4
}
```

### UI — History View Changes

**Session Row (collapsed state) — existing + additions:**

```
[ ▶ ] Package Name   Tutor · Date · Duration   Score   [ ▶ Play ] [ 📄 Transcript ] [ 📊 Analysis ]
```

- `[ ▶ Play ]` and `[ 📄 Transcript ]` are new icon-buttons added to the row actions column
- Clicking either expands an accordion panel below that row (only one open at a time)

**Expanded: Recording Panel**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎙️  Recording — Session with Alex · Dec 14, 2024               │
│                                                                   │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━○─────────────────────────────────  │
│  00:18                                         30:47              │
│                                                                   │
│  [  ⏮  ]  [  ⏪  ]  [  ▶  ]  [  ⏩  ]  [  ⏭  ]   🔊 ─────   │
│                                                                   │
│  Speed: [ 0.75x ] [ 1x ✓ ] [ 1.25x ] [ 1.5x ] [ 2x ]           │
│                                                        [⬇ Export] │
└─────────────────────────────────────────────────────────────────┘
```

- All controls are visual mock (onClick shows toast "Recording playback is simulated")
- Export button shows toast "Exported to ~/Downloads/session-alex-dec14.mp3"

**Expanded: Transcript Panel**

```
┌─────────────────────────────────────────────────────────────────┐
│  📄  Transcript — Session with Alex · Dec 14, 2024              │
│  [ 🔍 Search in transcript... ]                   [⬇ Download]  │
│─────────────────────────────────────────────────────────────────│
│                                                                   │
│  00:00:12  🤖 Alex                                               │
│  "Tell me about a time you led a cross-functional team."         │
│                                                                   │
│  00:00:18  👤 You                                                 │
│  "Yeah so basically I was the lead on this project and um we     │
│   had like five teams involved..."                                │
│                                                                   │
│  00:00:45  🤖 Alex                                               │
│  "Good. Can you quantify the impact? Revenue, time saved?"       │
│                                                                   │
│  ...                                                              │
│                                                        [⬇ Export] │
└─────────────────────────────────────────────────────────────────┘
```

- AI speaker rows have a distinct left-border accent (purple)
- User rows have a neutral left-border (blue)
- Search input filters visible turns in real-time (vanilla JS `filter()` on rendered elements)
- Download shows toast "Transcript saved to ~/Downloads/session-alex-dec14.txt"

### State Changes

```js
State.expandedHistoryRow = null; // sessionId of currently expanded row
State.expandedHistoryPanel = null; // 'recording' | 'transcript'
```

### New Window Globals

```js
window.toggleHistoryPanel(sessionId, panel); // 'recording' | 'transcript'
window.searchTranscript(query);
```

---

## Feature 2 — File Manager & Markdown Editor

### Goal

A dedicated `#files` view where users can upload `.md`, `.pdf`, `.docx` files. Files are stored in a local root folder set during first-time setup (`~/.iprep/uploads/` — mocked as dummy folder in demo). Users can organize files into folders, create new `.md` files, and edit/view them in a minimal mock editor. PDF/DOCX are view-only (no editor).

### New Route

`#files` → `renderFiles()` — registered in `viewMap`

Sidebar nav entry: **"📁 Files"** — added between History and Settings.

### Mock Data Changes (`mock-data.json`)

New top-level `fileSystem` key:

```json
"fileSystem": {
  "storageRoot": "~/.iprep/uploads/",
  "folders": [
    {
      "id": "folder_001",
      "name": "Interview Notes",
      "createdAt": "2024-12-01T10:00:00Z",
      "files": [
        {
          "id": "file_001",
          "name": "behavioral-prep.md",
          "type": "md",
          "sizeKB": 4.2,
          "createdAt": "2024-12-01T10:05:00Z",
          "updatedAt": "2024-12-10T14:22:00Z",
          "content": "# Behavioral Interview Prep\n\n## STAR Method\n\n**Situation** — Set the context...\n\n**Task** — Describe your responsibility...\n\n**Action** — Explain what you did...\n\n**Result** — Share the outcome with metrics.\n\n---\n\n## My Stories\n\n### Leadership Story\n...",
          "folderId": "folder_001"
        },
        {
          "id": "file_002",
          "name": "system-design-notes.md",
          "type": "md",
          "sizeKB": 6.8,
          "createdAt": "2024-12-05T09:00:00Z",
          "updatedAt": "2024-12-12T11:45:00Z",
          "content": "# System Design Notes\n\n## Key Concepts\n- Load Balancing\n- Caching strategies\n- Database sharding\n",
          "folderId": "folder_001"
        }
      ]
    },
    {
      "id": "folder_002",
      "name": "Uploaded Docs",
      "createdAt": "2024-12-08T08:00:00Z",
      "files": [
        {
          "id": "file_003",
          "name": "resume-v3.pdf",
          "type": "pdf",
          "sizeKB": 184.0,
          "createdAt": "2024-12-08T08:15:00Z",
          "updatedAt": "2024-12-08T08:15:00Z",
          "content": null,
          "folderId": "folder_002"
        },
        {
          "id": "file_004",
          "name": "offer-letter.pdf",
          "type": "pdf",
          "sizeKB": 92.5,
          "createdAt": "2024-12-09T10:00:00Z",
          "updatedAt": "2024-12-09T10:00:00Z",
          "content": null,
          "folderId": "folder_002"
        }
      ]
    }
  ],
  "rootFiles": [
    {
      "id": "file_005",
      "name": "quick-notes.md",
      "type": "md",
      "sizeKB": 1.1,
      "createdAt": "2024-12-14T18:00:00Z",
      "updatedAt": "2024-12-14T18:30:00Z",
      "content": "# Quick Notes\n\nThings to remember before the interview...",
      "folderId": null
    }
  ]
}
```

### UI Layout — Files View (Two-Panel)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  📁 Files                                    [ + New File ]  [ + New Folder ]  [⬆ Upload] │
├────────────────────┬─────────────────────────────────────────────────────────────┤
│  FILE TREE         │  EDITOR / VIEWER                                            │
│  ────────────────  │  ─────────────────────────────────────────────────────────  │
│  📁 Interview Notes│                                                             │
│    📝 behavioral.. │                                                             │
│    📝 system-des.. │        (nothing selected)                                   │
│  📁 Uploaded Docs  │        Select a file from the left panel                   │
│    📄 resume-v3.pdf│        or create a new one.                                │
│    📄 offer-letter │                                                             │
│  ──────────────────│                                                             │
│  📝 quick-notes.md │                                                             │
│                    │                                                             │
└────────────────────┴─────────────────────────────────────────────────────────────┘
```

**File Tree Panel (left, fixed width ~240px)**

- Folders are collapsible (click folder name to expand/collapse)
- File rows show icon by type: `📝` = .md, `📄` = PDF/DOCX
- Active file row highlighted with accent left-border
- Right-click (or `⋯` kebab on hover) → context menu: Rename / Move / Delete
- Folder rows show `⋯` on hover → Rename / Delete folder

**Editor/Viewer Panel (right, fills remaining space)**

When a `.md` file is selected — Editor mode:

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 behavioral-prep.md          [ Edit ] [ Preview ] [ Save ✓ ] │
│─────────────────────────────────────────────────────────────────│
│  EDIT mode:                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ # Behavioral Interview Prep                                │ │
│  │                                                            │ │
│  │ ## STAR Method                                             │ │
│  │                                                            │ │
│  │ **Situation** — Set the context...                         │ │
│  │ **Task** — Describe your responsibility...                 │ │
│  │ **Action** — Explain what you did...                       │ │
│  │ **Result** — Share the outcome with metrics.               │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Last saved: 2 min ago · 4.2 KB                                  │
└─────────────────────────────────────────────────────────────────┘
```

- `<textarea>` element for editing (monospace font, full panel height)
- `[ Preview ]` tab renders the markdown via `formatAIText()` in a read-only div
- `[ Save ]` — writes content back to `State.data.fileSystem` mock + shows toast "Saved"
- Auto-save indicator: debounced 2s after last keystroke → "Saving..." → "Saved"

When a `.pdf` or `.docx` file is selected — Viewer mode:

```
┌─────────────────────────────────────────────────────────────────┐
│  📄 resume-v3.pdf                                [⬇ Download]   │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│         ┌──────────────────────────────────────────┐            │
│         │                                          │            │
│         │   📄  PDF Preview                        │            │
│         │                                          │            │
│         │   resume-v3.pdf                          │            │
│         │   184 KB · Uploaded Dec 8, 2024          │            │
│         │                                          │            │
│         │   [Preview not available in demo mode]   │            │
│         │   Real app will render via PDF.js         │            │
│         │                                          │            │
│         └──────────────────────────────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**New Folder Modal:**

```
┌──────────────────────────────┐
│  New Folder                  │
│  ────────────────────────── │
│  Folder name                 │
│  [ __________________ ]      │
│                              │
│         [ Cancel ] [ Create ]│
└──────────────────────────────┘
```

**New File Modal:**

```
┌──────────────────────────────────┐
│  New Markdown File               │
│  ──────────────────────────────  │
│  File name (.md auto-added)      │
│  [ ________________________ ]    │
│                                  │
│  Save in folder                  │
│  [ Root (no folder)        ▾ ]  │
│                                  │
│           [ Cancel ] [ Create ]  │
└──────────────────────────────────┘
```

**Upload Modal (drag-drop zone + file input):**

```
┌──────────────────────────────────────────────┐
│  Upload Files                                 │
│  ────────────────────────────────────────── │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │   ⬆️  Drag files here                  │  │
│  │   or click to browse                   │  │
│  │                                        │  │
│  │   Supported: .md  .pdf  .docx          │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Save to folder: [ Root (no folder)     ▾ ] │
│                                               │
│  Stored at: ~/.iprep/uploads/                 │
│  (change in Settings → Storage)              │
│                                               │
│              [ Cancel ] [ Upload ]            │
└──────────────────────────────────────────────┘
```

- Upload adds a mock entry to `State.data.fileSystem` + shows toast "Uploaded resume-v3.pdf"
- File input filter: `.md,.pdf,.docx` only; reject others with toast "Only .md, .pdf, .docx files allowed"

### State Changes

```js
State.filesView = 'tree'; // always 'tree' for now (future: grid)
State.selectedFileId = null; // id of open file
State.editorMode = 'edit'; // 'edit' | 'preview'
State.expandedFolders = new Set(); // folder ids that are expanded
State.fileModal = null; // 'new-file' | 'new-folder' | 'upload' | null
```

### New MockAPI Methods

```js
MockAPI.getFileSystem(); // returns fileSystem from mock-data.json
MockAPI.getFile(id); // returns single file object
MockAPI.saveFile(id, content); // updates content + updatedAt in State
MockAPI.createFile(name, folderId); // adds to fileSystem.rootFiles or folder.files
MockAPI.createFolder(name); // adds to fileSystem.folders
MockAPI.uploadFile(name, type, folderId); // mock upload → adds entry
MockAPI.deleteFile(id); // removes from fileSystem
MockAPI.deleteFolder(id); // removes folder + its files
```

### New Window Globals

```js
window.selectFile(id);
window.toggleFolder(folderId);
window.setEditorMode(mode); // 'edit' | 'preview'
window.saveCurrentFile();
window.openFileModal(type); // 'new-file' | 'new-folder' | 'upload'
window.closeFileModal();
window.confirmCreateFile();
window.confirmCreateFolder();
window.confirmUpload();
window.deleteFile(id);
window.deleteFolder(id);
```

---

## Feature 3 — Communication Analysis & Suggestions

### Goal

After each interview session ends, an "auto-analysis job" runs on the session transcript. It identifies: (1) filler/weak words overused by the user, (2) common professional phrases the user could use instead, (3) sentence-level rewrites for top 3 worst answers. The results are shown in two places: a new **Communication** tab in the Analysis view, and a standalone **`#communication`** view for lifetime stats across all sessions.

### The Analysis Engine (Mock Logic)

Simulated in JS with keyword matching — no actual NLP:

**Filler words to detect** (check `speaker === 'user'` turns):

```js
const FILLER_WORDS = [
  'basically',
  'literally',
  'actually',
  'honestly',
  'like',
  'um',
  'uh',
  'you know',
  'right',
  'so basically',
  'kind of',
  'sort of',
  'just',
  'anyway',
  'obviously',
];
```

**Professional alternatives map:**

```js
const PROFESSIONAL_MAP = {
  basically: 'fundamentally / in essence / at its core',
  literally: 'precisely / in fact / directly',
  actually: 'in practice / from experience',
  honestly: 'candidly / to be direct',
  like: '(remove or use: such as / for example)',
  'kind of': 'somewhat / to an extent / partially',
  'sort of': 'to some degree / in a sense',
  just: '(remove — weakens statements)',
  obviously: '(remove — can sound condescending)',
  'um / uh': '(pause silently — it signals thought)',
  'you know': '(remove — use a pause instead)',
  'so basically': 'to summarize / in essence',
  anyway: 'moving forward / to continue',
};
```

**Sentence rewrite patterns** (mock — hardcoded rewrites for demo):

- Weak: `"Yeah so I was kind of the lead..."` → Strong: `"I served as the technical lead, responsible for..."`
- Weak: `"We basically just did the thing and it worked"` → Strong: `"We implemented X, which resulted in Y% improvement"`
- Weak: `"I think maybe I could have done better"` → Strong: `"On reflection, I would approach X differently by..."`

### Mock Data Changes (`mock-data.json`)

Add `communicationAnalysis` to each analysis object (anal_001–003):

```json
"communicationAnalysis": {
  "sessionId": "sess_001",
  "analyzedAt": "2024-12-14T14:35:00Z",
  "totalUserWords": 1284,
  "totalUserTurns": 12,
  "overallCommunicationScore": 6.2,
  "fillerWordStats": [
    { "word": "basically", "count": 8, "percentOfTotal": 0.62, "severity": "high" },
    { "word": "like", "count": 14, "percentOfTotal": 1.09, "severity": "high" },
    { "word": "um", "count": 11, "percentOfTotal": 0.86, "severity": "medium" },
    { "word": "kind of", "count": 5, "percentOfTotal": 0.39, "severity": "medium" },
    { "word": "just", "count": 9, "percentOfTotal": 0.70, "severity": "low" }
  ],
  "topReplacements": [
    {
      "original": "like",
      "betterAlternatives": ["such as", "for example", "(remove)"],
      "exampleInContext": "\"...we had like five teams...\" → \"...we had five cross-functional teams...\""
    },
    {
      "original": "basically",
      "betterAlternatives": ["fundamentally", "in essence", "at its core"],
      "exampleInContext": "\"So basically I was the lead\" → \"I served as the technical lead\""
    },
    {
      "original": "um / uh",
      "betterAlternatives": ["(silent pause)", "(structured pause)"],
      "exampleInContext": "Replace with a 1–2 second pause to signal considered thinking"
    }
  ],
  "sentenceRewrites": [
    {
      "original": "Yeah so basically I was the lead on this project and um we had like five teams involved",
      "rewritten": "I served as the technical lead on this initiative, coordinating across five cross-functional teams.",
      "improvement": "Removed 3 filler words, added role specificity and professional framing"
    },
    {
      "original": "We kind of just figured it out and it worked out pretty well",
      "rewritten": "We identified the root cause and implemented a solution that reduced deployment time by 40%.",
      "improvement": "Replaced vague language with concrete outcome and metric"
    }
  ],
  "strengthsInCommunication": [
    "Clear problem statement at the start of each answer",
    "Good use of pauses before complex answers",
    "Logical sequencing of events (chronological order)"
  ]
}
```

Add a `lifetimeCommunication` section to `stats{}`:

```json
"lifetimeCommunication": {
  "avgCommunicationScore": 6.4,
  "totalFillerWordsAllTime": 187,
  "topFillerAllTime": "like",
  "improvementTrend": [
    { "sessionLabel": "Dec 1", "score": 5.8 },
    { "sessionLabel": "Dec 5", "score": 6.1 },
    { "sessionLabel": "Dec 10", "score": 6.3 },
    { "sessionLabel": "Dec 14", "score": 6.2 }
  ],
  "mostImprovedArea": "Reduced 'basically' usage by 60% over 8 sessions",
  "nextFocusArea": "Silent pauses instead of 'um/uh'"
}
```

### UI — Analysis View: New "Communication" Tab

The existing Analysis view has an accordion. Add a **5th tab / section** labeled `🗣️ Communication` alongside the existing score sections:

```
[ Overview ] [ Strengths ] [ Improvements ] [ Answers ] [ 🗣️ Communication ]
```

**Communication Tab Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗣️  Communication Analysis                                      │
│  Auto-analyzed after session · Dec 14, 2024 at 2:35 PM          │
│─────────────────────────────────────────────────────────────────│
│                                                                   │
│  Communication Score                                             │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○──────             │
│  6.2 / 10           Good progress — 3 key areas to fix           │
│                                                                   │
│  ─────────────────────────────────────────────────────          │
│                                                                   │
│  Filler Words Detected                                           │
│                                                                   │
│  "like"      ████████████████  14×   HIGH       → such as       │
│  "um / uh"   ████████████      11×   MEDIUM     → silent pause  │
│  "basically" ████████           8×   HIGH       → in essence    │
│  "just"      ████████           9×   LOW        → (remove)      │
│  "kind of"   ████               5×   MEDIUM     → to some extent│
│                                                                   │
│  ─────────────────────────────────────────────────────          │
│                                                                   │
│  Sentence Rewrites (Top 2)                                       │
│                                                                   │
│  ❌ You said:                                                     │
│  "Yeah so basically I was the lead on this project and um we     │
│   had like five teams involved"                                   │
│                                                                   │
│  ✅ Better:                                                       │
│  "I served as the technical lead on this initiative,             │
│   coordinating across five cross-functional teams."               │
│                                                                   │
│  💡 "Removed 3 filler words, added role specificity"             │
│  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─           │
│  ❌ You said: ...  ✅ Better: ...                                 │
│                                                                   │
│  ─────────────────────────────────────────────────────          │
│                                                                   │
│  What you did well                                               │
│  ✓ Clear problem statement at the start of each answer           │
│  ✓ Good use of pauses before complex answers                     │
│  ✓ Logical sequencing of events                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### UI — Standalone `#communication` View

New sidebar nav entry: **"🗣️ Communication"** — between Analysis and History (or after Files).

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🗣️  Communication Coach                                                         │
│  Track and improve how you express yourself across all interviews                │
│─────────────────────────────────────────────────────────────────────────────────│
│                                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │  Avg Score    │  │  Filler Words │  │  Sessions     │  │  Top Culprit  │   │
│  │   6.4/10      │  │  187 total    │  │  Analyzed: 8  │  │  "like" × 87  │   │
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                                                   │
│  Score Trend (last 4 sessions)                                                   │
│  10 │                                                                             │
│   8 │                                                                             │
│   6 │  ●───●───●───●                                                             │
│   4 │                                                                             │
│     └─────────────────────────────────                                           │
│        Dec 1  Dec 5  Dec 10  Dec 14                                              │
│                                                                                   │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                   │
│  Your Top Filler Words — All Time                                                │
│                                                                                   │
│  "like"      ██████████████████████████  87×  → such as / for example           │
│  "um"        ████████████████            63×  → silent pause                    │
│  "basically" ████████████               47×  → in essence / at its core         │
│  "just"      ██████████                 37×  → (remove — weakens your point)   │
│  "kind of"   ██████                     21×  → to some extent / partially       │
│  "honestly"  ████                       16×  → candidly / to be direct          │
│                                                                                   │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                   │
│  Professional Vocabulary Reference                                               │
│  Words to retire → Professional replacements                                    │
│                                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Retire           │  Use Instead                │  Why                  │   │
│  │─────────────────────────────────────────────────────────────────────── │   │
│  │  "basically"      │  fundamentally, in essence   │  more precise         │   │
│  │  "like" (filler)  │  such as, for example        │  adds clarity         │   │
│  │  "kind of"        │  to some extent, partially   │  sounds decisive      │   │
│  │  "sort of"        │  to a degree, in a sense     │  sounds confident     │   │
│  │  "honestly"       │  candidly, to be direct      │  professional tone    │   │
│  │  "just" (hedge)   │  (remove entirely)           │  strengthens claims   │   │
│  │  "um / uh"        │  (silent pause)              │  signals calm thought │   │
│  │  "obviously"      │  (remove)                    │  avoids condescension │   │
│  │  "you know"       │  (pause + continue)          │  removes filler       │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                   │
│  Focus Area This Week                                                             │
│                                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  🎯  Target: Replace "like" as a filler                                  │   │
│  │                                                                          │   │
│  │  Practice drill: Before each answer, pause 1 second and commit to       │   │
│  │  using "for example" or "such as" whenever you want to say "like".      │   │
│  │                                                                          │   │
│  │  You used "like" 14× in your last session. Target: under 5 next time.  │   │
│  │                                                                          │   │
│  │                              [ Start Practice Session → ]                │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
│  Recent Session Communication Scores                                             │
│                                                                                   │
│  Dec 14  with Alex      6.2/10  ████████████░░░░  [ View Details ]              │
│  Dec 10  with Priya     6.3/10  ████████████░░░░  [ View Details ]              │
│  Dec 5   with Morgan    6.1/10  ████████████░░░░  [ View Details ]              │
│  Dec 1   with Alex      5.8/10  ███████████░░░░░  [ View Details ]              │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Post-Session Auto-Job Simulation

When `endSession()` is called → after 2s delay → show an in-progress toast:

```
🔄  Analyzing your communication patterns...
```

After another 2s (total 4s) → show success toast:

```
✅  Communication analysis ready  [ View → ]
```

`[ View → ]` navigates to `#analysis` and auto-scrolls to the Communication tab.

This simulates the background job that would run in production.

### AI Chat Integration

Add two new patterns to `getAIResponse()`:

- `/communication|filler|words|um|basically|like.*filler/` →
  Returns: top 3 fillers from latest session + 2 replacement suggestions + link to `#communication`

- `/sentence|rewrite|express|articulate|professional.*words/` →
  Returns: one example sentence rewrite from latest session + tip about pausing instead of filler words

---

## Implementation Order

1. **Mock data first** — add all new fields to `mock-data.json` before any UI work
2. **Feature 1** — History accordion (smallest scope, builds on existing view)
3. **Feature 3 tab** — Communication tab inside existing Analysis view (leverages existing accordion pattern)
4. **Feature 2** — Files view (new route, most isolated, needs its own CSS section)
5. **Feature 3 standalone** — Communication view + post-session toast flow
6. **AI Chat patterns** — add last, after communication mock data is stable

---

## CSS Additions Needed (`style.css`)

| Component                               | Class Prefix                                                      | Notes                            |
| --------------------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| History accordion row expanded state    | `.history-row--expanded`                                          | Adds border-bottom gap           |
| Recording player mock                   | `.recording-player`                                               | Flex row, scrubber bar, controls |
| Transcript panel                        | `.transcript-panel`, `.transcript-turn`                           | Two speaker variants             |
| File tree                               | `.file-tree`, `.file-tree-folder`, `.file-tree-file`              | Collapsible, indent              |
| MD editor                               | `.md-editor`, `.md-editor-tabs`, `.md-editor-area`, `.md-preview` | Textarea + preview panel         |
| Upload zone                             | `.upload-dropzone`                                                | Dashed border, hover state       |
| Communication bar chart                 | `.comm-bar`, `.comm-bar-fill`                                     | Width driven by inline style     |
| Rewrite card                            | `.rewrite-card`, `.rewrite-card--before`, `.rewrite-card--after`  | Red/green variant                |
| Communication score trend (ASCII-style) | `.trend-chart`                                                    | Simple inline SVG polyline       |

---

## Files to Touch

| File             | Changes                                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mock-data.json` | Add `hasRecording`, `transcript[]` to sessions; add `fileSystem{}` top-level; add `communicationAnalysis{}` to analysis objects; add `lifetimeCommunication{}` to stats |
| `app.js`         | New `MockAPI` methods; new render functions; new State keys; new `viewMap` entries; extend `getAIResponse()`; post-session auto-job toast                               |
| `style.css`      | New component classes per table above                                                                                                                                   |
| `index.html`     | Add sidebar nav entries for Files + Communication                                                                                                                       |
| `CLAUDE.md`      | Update Views table + Features Implemented + Files table                                                                                                                 |
