---
name: iPrep onboarding brainstorm and first interview
description: Brainstorming notes for the first-run onboarding workflow, interview setup, and post-session analysis experience.
---

# iPrep Onboarding Brainstorm

This document captures the first-run onboarding idea for iPrep: how a new user sets up the local workspace, connects AI providers, adds preparation context, starts an interview, and receives analysis after the session.

The goal is to keep onboarding short enough to finish quickly while still collecting the minimum context needed for useful interview practice.

## First-Run Setup Flow

The user starts onboarding from the CLI:

```bash
npx iprep onboard --yes
```

The command should prepare the local iPrep workspace by creating:

- The `.iprep` folder
- The local database
- The required folder structure for notes, uploads, transcripts, recordings, and reports
- The local server connection by internally running `iprep start`

After the server starts, the hosted frontend connects to the local `localhost` server and continues onboarding in the browser.

## Browser Onboarding Screens

If this is the user's first setup, the UI should guide them through three short screens.

### Screen 1: Basic Details

Collect the user's identity so the app can personalize dashboards, reports, and AI responses.

| Field | Notes    |
| ----- | -------- |
| Name  | Required |
| Email | Optional |

### Screen 2: Goal And Context

Collect the user's preparation goal and optional resume context.

| Field         | Notes                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------- |
| Goal          | Example: Java backend interview, HR round, DSA practice, communication improvement           |
| Resume upload | Optional; if supported, convert the file into Markdown using the server-side MarkItDown flow |

### Screen 3: AI Provider

Collect the AI provider details needed to run interviews and analysis.

| Field       | Notes                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| AI provider | Claude, OpenAI, Gemini, OpenRouter, Ollama, or another supported provider |
| API key     | Bring-your-own-key setup for the selected provider                        |

## Home Screen Follow-Up

After onboarding, the home screen should show any missing setup items as clear next actions.

- Confirm or update the interview goal
- Upload a resume
- Upload preparation notes
- Add a Deepgram API key for voice interview support
- Add or update AI provider keys

Once the minimum setup is complete, the user can start an interview.

## Interview Session Flow

The expected interview flow is:

1. User starts an interview.
2. User completes the interview and hangs up the call.
3. The app navigates the user to the home screen or the analysis page.
4. If analysis is still running, the UI should clearly tell the user not to close the terminal.
5. The AI saves the recording, generates the transcript, analyzes the transcript, and stores the analysis in the database.
6. The user receives a notification when the analysis is ready.

After analysis is complete, the user can review:

- Current session analysis
- Past performance trends
- Suggestions and daily vocabulary
- Chat-based discussion about performance and improvement areas
- Generated analytics from interview history

## Creating A New Interview

Users should be able to create a new interview in two ways:

| Path                | Description                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Ready-made template | User selects from predefined interview templates, with resume and notes added as context.                          |
| AI-guided setup     | User chats with AI, explains what they want to practice, and the AI turns that intent into a structured interview. |

## Interview Modes

iPrep can support three interview modes over time:

- Chat
- Voice
- Live presentation based

For the first version, focus on chat and voice interviews.

## Ready-Made Template Flow

Ready-made templates are created by the iPrep team. The user only needs to choose the interview style, difficulty, duration, tutor profile, and context.

### Step 1: Choose Interview Basics

| Setting          | Options                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| Interview type   | Behavioral, HR, Technical, Communication, DSA, System Design, Automation Testing |
| Difficulty level | Easy, Medium, Hard                                                               |
| Duration         | 15 min, 25 min, 30 min                                                           |

### Step 2: Choose AI Tutor Profile

Tutor profiles should be suggested based on the interview type and difficulty selected in step 1.

| Tutor style | Description                                             |
| ----------- | ------------------------------------------------------- |
| Direct      | Challenging, practical, and no-nonsense                 |
| Supportive  | Warm, encouraging, and beginner-friendly                |
| Strict      | High standards, precise feedback, and less hand-holding |

### Step 3: Review And Start Session

Before starting, the user should review the interview setup and make final edits.

- Mode
- Duration
- Interview type
- Selected notes
- Resume context
- User-defined questions
- Generated question plan

The app should also ask whether the user wants to add more context, such as notes, custom questions, or specific topics. After confirmation, the structured interview payload is sent to the voice or chat engine and the interview starts.

## AI-Guided Interview Setup

In the chat section, the user can describe what they want to practice. The AI should ask focused follow-up questions, infer the user's intent, and convert the conversation into the same structured interview format used by ready-made templates.

The chat flow should collect enough information to produce:

- Interview type
- Difficulty
- Duration
- Mode
- Tutor style
- Context files or notes
- Target topics
- Custom questions, if any

The final output should be stored as structured JSON so the app can generate the interview consistently, even when the user starts from a free-form conversation.
