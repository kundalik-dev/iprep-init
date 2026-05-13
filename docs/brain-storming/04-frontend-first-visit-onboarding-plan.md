---
name: Frontend first-visit onboarding plan
description: Plan for the hosted frontend onboarding setup shown to first-time iPrep users, including first-time detection, three onboarding pages, API usage, and persistence behavior.
---

# Frontend First-Visit Onboarding Plan

This document plans the frontend onboarding setup that should run when a user visits the hosted iPrep UI for the first time.

It builds on:

- [`01-iprep-onboarding-and-first-interview.md`](./01-iprep-onboarding-and-first-interview.md)
- [`02-iprep-system-design-and-wrokflow.md`](./02-iprep-system-design-and-wrokflow.md)
- [`03-onboarding-api-latest-changes.md`](./03-onboarding-api-latest-changes.md)
- [`api-requirements.md`](./api-requirements.md)

## Product Goal

When the hosted Vercel frontend opens, it should connect to the local iPrep server at `http://localhost:5545/api/v1`.

If the local server says onboarding is incomplete, the frontend should show a three-page onboarding setup before the normal dashboard.

The onboarding flow should collect:

1. User profile: name and optional email.
2. Goal and context: selected goal types, short goal description, optional resume upload.
3. AI provider: default CLI Claude setup, plus selectable provider/mode/API key/model options with test connection.

All saved onboarding data belongs in the local database through the server. The hosted frontend should not persist onboarding completion as the source of truth.

## First-Time Detection

The frontend should determine first-time state from the local server, not from browser-only storage.

Recommended startup sequence:

1. Frontend boots and calls `GET /api/v1/health`.
2. If health fails, show a local server connection screen.
3. If health passes, call `GET /api/v1/bootstrap`.
4. Read `data.onboarding.isComplete`, `data.onboarding.missingSteps`, and the returned user/provider state.
5. If onboarding is incomplete, route to `/onboarding`.
6. If onboarding is complete, route to the dashboard.

Fallback if `bootstrap` is not ready yet:

1. Call `GET /api/v1/onboarding`.
2. Use `isOnboardingComplete` or equivalent returned progress fields.
3. Route based on that response.

Local browser storage may be used only as a UX cache, for example remembering the last visible onboarding page. It must not decide whether onboarding is complete.

## Server-Side Source Of Truth

The server should decide first-time status from the DB.

Expected local-only behavior:

- If no `UserOnboarding` row exists for `LOCAL_USER_ID`, onboarding is first-time and incomplete.
- If a `UserOnboarding` row exists but `isOnboardingComplete` is false, resume from the saved `onboardingStep`.
- If `User.isOnboardingComplete` or onboarding state says complete, skip onboarding.
- Provider setup should be considered incomplete unless a working provider credential exists or CLI Claude is confirmed available.

The frontend should treat the server response as authoritative because the user can clear browser storage, switch browsers, or revisit the Vercel UI later.

## Onboarding Route Model

Suggested frontend routes:

| Route | Purpose |
| ----- | ------- |
| `/connect-local` | Shown when `localhost:5545` is unreachable. |
| `/onboarding/profile` | Page 1: name and email. |
| `/onboarding/goal` | Page 2: goal and resume context. |
| `/onboarding/provider` | Page 3: AI provider setup. |
| `/dashboard` | First normal app screen after onboarding completion. |

If using React Router later, guard app routes with an onboarding loader:

- `serverUnavailable` -> `/connect-local`
- `onboardingIncomplete` -> saved onboarding step route
- `onboardingComplete` -> requested route or `/dashboard`

## Page 1: Profile

Purpose: collect local user identity for dashboards, reports, and AI personalization.

Fields:

| Field | Required | Notes |
| ----- | -------- | ----- |
| Name | Yes | Display name used throughout reports and AI prompts. |
| Email | No | Optional local profile metadata. No login in first version. |

Validation:

- Name must be non-empty after trim.
- Email is optional, but if present should be valid email format.

Primary action:

- `Continue`

API:

```txt
POST /api/v1/onboarding/profile
```

Request:

```json
{
  "name": "Kundalik",
  "email": "kundalik@example.com"
}
```

Expected behavior:

- Save or update the single local user profile.
- Persist onboarding step as `GOAL`.
- Return the updated user and next step.

## Page 2: Goal And Resume

Purpose: capture what the user wants to improve and optionally upload resume context.

Layout:

- Two selectable card-checkbox options at the top.
- Short description textarea below.
- Optional resume upload below the description.

Goal cards:

| Value | Label | Description |
| ----- | ----- | ----------- |
| `INTERVIEW_PRACTICE` | Interview practice | Practice realistic HR, behavioral, technical, DSA, system design, or role-specific interviews. |
| `COMMUNICATION_IMPROVEMENT` | Communication improvement | Improve clarity, confidence, vocabulary, filler words, pacing, and answer structure. |

Fields:

| Field | Required | Notes |
| ----- | -------- | ----- |
| Goal type | Yes | Both cards can be selected. Interview practice is for interview preparation; communication improvement is for client-facing or English communication improvement. |
| Short description | Yes | User describes target role, interview type, weakness, timeline, or communication goal. |
| Resume upload | No | Accept `.pdf`, `.docx`, `.md` for first version. |

Decision:

- Allow one or both goal cards.
- Store the free-text description as `goal`.
- Add a future `goalTypes` array field to API/DB if not already present.

Resume upload flow:

1. If user selects a resume, keep it in frontend form state until the user clicks `Continue`.
2. On `Continue`, upload it first with `POST /api/v1/documents/upload`.
2. Read returned `data.id` as `resumeDocumentId`.
3. Save goal with `POST /api/v1/onboarding/goal`.

Upload API:

```txt
POST /api/v1/documents/upload
```

Request:

- `multipart/form-data`
- `file`: selected resume
- `convertToMarkdown`: `true`
- Optional `tags`: `resume,onboarding`

Goal API:

```txt
POST /api/v1/onboarding/goal
```

Recommended request:

```json
{
  "goalTypes": ["INTERVIEW_PRACTICE", "COMMUNICATION_IMPROVEMENT"],
  "goal": "I want to prepare for Java backend interviews with focus on system design and behavioral rounds.",
  "resumeDocumentId": "doc_resume_001"
}
```

Current documented request only includes `goal` and `resumeDocumentId`. If `goalTypes` is not implemented yet, frontend can fold the selected card labels into the text summary until the API is extended.

Expected behavior:

- Save goal and optional resume reference on the user profile.
- Persist onboarding step as `PROVIDER`.

## Page 3: AI Provider

Purpose: configure the AI provider needed for interviews and analysis.

Default state:

- Provider: Claude
- Mode: CLI
- Model name: `claude-sonnet-4-20250514`
- Status: not tested until the frontend calls test connection

Provider modes:

| Mode | Providers | Required fields |
| ---- | --------- | --------------- |
| CLI | Claude, Codex, Gemini | Provider selection, optional model name, local CLI test. |
| API key | Claude, Codex, Gemini, Ollama, OpenRouter | Provider selection, API key, model name, test connection. |

UI shape:

- Segmented control or tabs for provider mode: `CLI` and `API Key`.
- Provider cards or select menu inside each mode.
- API key field only when `API Key` mode is active.
- Model name field for provider-specific model selection.
- `Test Connection` button before saving.
- `Finish Setup` button enabled only after successful provider test.
- User cannot skip provider setup. At least one CLI-based or API-key-based AI agent must pass `Test Connection`.

Provider/model options should be configured from the frontend constants file:

```txt
apps/frontend/src/lib/provider-models.ts
```

Initial default model decisions:

| Provider | Default model | Notes |
| -------- | ------------- | ----- |
| Claude | `claude-sonnet-4-20250514` | Balanced default for interviews and coaching. |
| Codex | `gpt-5.3-codex` | Best current Codex default for agentic coding and technical practice. |
| Gemini | `gemini-2.5-flash` | Best price-performance default. |
| Ollama | `qwen3` | Local default with broad reasoning coverage. |
| OpenRouter | `anthropic/claude-sonnet-4` | Quality-first OpenRouter default; exact availability can be checked with OpenRouter models API. |

These values are configurable and should not be hardcoded inside onboarding components.

API: test provider

```txt
POST /api/v1/onboarding/provider/test
```

Recommended request for CLI Claude:

```json
{
  "provider": "claude",
  "mode": "CLI",
  "modelName": "default"
}
```

Recommended request for API key provider:

```json
{
  "provider": "claude",
  "mode": "API_KEY",
  "apiKey": "sk-ant-...",
  "modelName": "claude-sonnet-4-5"
}
```

API: save provider

```txt
POST /api/v1/onboarding/provider
```

Recommended request:

```json
{
  "provider": "claude",
  "mode": "CLI",
  "modelName": "default",
  "makeDefault": true
}
```

For API key mode:

```json
{
  "provider": "claude",
  "mode": "API_KEY",
  "apiKey": "sk-ant-...",
  "modelName": "claude-sonnet-4-5",
  "makeDefault": true
}
```

API: complete onboarding

```txt
POST /api/v1/onboarding/complete
```

Expected behavior:

- Server verifies profile, goal, and provider requirements.
- CLI mode can complete onboarding if the selected CLI provider test passes. For example, CLI Claude can complete onboarding without an API key if the local Claude command passes the server-side test.
- API key mode can complete onboarding if the selected provider API test passes.
- Server marks onboarding complete in DB.
- Frontend redirects to `/dashboard`.

## Frontend State Machine

Recommended frontend state:

```ts
type OnboardingStep = 'profile' | 'goal' | 'provider' | 'complete'

type OnboardingState = {
  isLoading: boolean
  serverStatus: 'checking' | 'online' | 'offline'
  isComplete: boolean
  currentStep: OnboardingStep
  missingSteps: string[]
  profile: {
    name: string
    email?: string
  }
  goal: {
    goalTypes: Array<'INTERVIEW_PRACTICE' | 'COMMUNICATION_IMPROVEMENT'>
    description: string
    resumeDocumentId?: string
  }
  provider: {
    provider: 'claude' | 'codex' | 'gemini' | 'ollama' | 'openrouter'
    mode: 'CLI' | 'API_KEY'
    modelName?: string
    testStatus: 'idle' | 'testing' | 'passed' | 'failed'
  }
}
```

## API Contract Gaps To Resolve

The latest onboarding API note is ahead of the main `api-requirements.md` in one important place:

- `POST /api/v1/onboarding/provider/test` exists in latest changes but is missing from the exact endpoint list in `api-requirements.md`.

Recommended update to `api-requirements.md` later:

```txt
POST /api/v1/onboarding/provider/test
```

Potential new field:

```json
{
  "goalTypes": ["INTERVIEW_PRACTICE", "COMMUNICATION_IMPROVEMENT"]
}
```

The current API requirement only stores `goal` as text. The UI wants card-based goal selection, so the backend should either add a `goalTypes` field or the frontend should fold the selected types into the text goal for the first version.

## Error States

The onboarding UI should handle these states explicitly:

| State | UI behavior |
| ----- | ----------- |
| Local server offline | Show `/connect-local` with command guidance to run `iprep start` or onboarding CLI. |
| Database not ready | Show local status issue and retry button. |
| Resume upload fails | Keep user on Page 2; allow continuing without resume. |
| Provider test fails | Show provider-specific error and keep `Finish Setup` disabled. |
| API key save fails | Do not clear the key input until user edits or leaves the page. |
| Onboarding complete fails | Show missing required setup returned by server. |

## Implementation Order

1. Add frontend API client helpers for `health`, `bootstrap`, `onboarding`, provider test, provider save, document upload, and complete.
2. Add route guard or app-level startup loader.
3. Add `/connect-local` screen.
4. Add onboarding layout and stepper.
5. Build Page 1 profile form.
6. Build Page 2 goal cards, description, and resume upload.
7. Build Page 3 provider mode tabs, provider selection, API key/model inputs, and test connection.
8. Wire completion to dashboard redirect.
9. Add persisted server state hydration so users can resume partially completed onboarding.
10. Add focused tests for first-time detection and step transitions.

## Open Questions

1. What exact server command names should each CLI provider test use? Planned examples: `claude --version`, Codex CLI version command, Gemini CLI version command.
2. Should the server expose the provider/model constants through `GET /api/v1/providers`, or should the frontend own the list for the first version?
3. Should OpenRouter model options be static first, or fetched dynamically from OpenRouter through the local server?
