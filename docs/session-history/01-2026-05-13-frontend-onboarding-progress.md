---
name: Frontend onboarding progress handoff
description: Session report for the Vite React frontend onboarding setup, server API support, decisions made, and next implementation steps.
---

# Frontend Onboarding Progress - 2026-05-13

## Goal

Build the iPrep frontend foundation using Vite, React, TypeScript, Tailwind, and shadcn-style components, using the Claude HTML prototype as the visual reference.

Current feature goal: first-visit onboarding for the hosted Vercel UI that connects to the local iPrep server at `http://localhost:5545/api/v1`.

The onboarding setup must:

- Detect first-time users from server/DB state, not browser storage.
- Save user profile onboarding data in the local DB.
- Show three setup pages: profile, goal/resume, AI provider.
- Require at least one tested AI provider before onboarding can complete.
- Support CLI Claude as the default provider path.

## Product Decisions

- API source of truth is `docs/brain-storming/api-requirements.md`.
- Frontend is hosted on Vercel and talks to the local server on port `5545`.
- Onboarding cannot be skipped.
- Goal cards can both be selected:
  - `INTERVIEW_PRACTICE`
  - `COMMUNICATION_IMPROVEMENT`
- Resume upload happens when the user clicks `Continue` on the goal page.
- CLI Claude can complete onboarding if the local CLI test passes.
- API key mode must pass provider test before saving.
- Provider/model defaults are configurable in the frontend constants file.

## Planning Added

Created:

- `docs/brain-storming/04-frontend-first-visit-onboarding-plan.md`

Updated:

- `docs/log.md`

The plan covers first-time detection, three onboarding pages, DB-backed persistence, provider testing, resume upload, and open server contract gaps.

## Frontend Progress

Created Vite React TypeScript app:

- `apps/frontend`

Added frontend guidance:

- `apps/frontend/CLAUDE.md`

Implemented onboarding flow:

- `apps/frontend/src/App.tsx`
- `apps/frontend/src/index.css`
- `apps/frontend/src/features/onboarding/OnboardingScreen.tsx`
- `apps/frontend/src/features/onboarding/api.ts`
- `apps/frontend/src/features/onboarding/types.ts`
- `apps/frontend/src/lib/http.ts`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/lib/provider-models.ts`

Frontend behavior now:

- On app boot, call `GET /api/v1/health`.
- If local server is offline, show connect/retry screen.
- If health passes, call `GET /api/v1/bootstrap`.
- If bootstrap fails, fallback to `GET /api/v1/onboarding`.
- If onboarding incomplete, show onboarding setup.
- If onboarding complete, show dashboard shell.

Onboarding pages implemented:

- Page 1: name and optional email.
- Page 2: both goal cards selectable, description, optional resume upload on Continue.
- Page 3: provider selection, CLI/API key mode, model selection, test connection, finish setup after passing test.

Provider defaults added:

- Claude: `claude-sonnet-4-20250514`
- Codex: `gpt-5.3-codex`
- Gemini: `gemini-2.5-flash`
- Ollama: `qwen3`
- OpenRouter: `anthropic/claude-sonnet-4`

## Server Progress

Existing onboarding server code was already present:

- `GET /api/v1/onboarding`
- `POST /api/v1/onboarding/profile`
- `POST /api/v1/onboarding/goal`
- `POST /api/v1/onboarding/provider/test`
- `POST /api/v1/onboarding/provider`
- `POST /api/v1/onboarding/complete`
- `GET /api/v1/user`
- `PATCH /api/v1/user`

Added missing APIs for frontend onboarding:

- `GET /api/v1/bootstrap`
- `GET /api/v1/local/status`
- `GET /api/v1/documents`
- `POST /api/v1/documents/upload`

Server files added:

- `apps/server/src/controller/bootstrap.controller.ts`
- `apps/server/src/controller/document.controller.ts`
- `apps/server/src/routes/bootstrap.route.ts`
- `apps/server/src/routes/document.route.ts`

Server files updated:

- `apps/server/src/routes/index.ts`
- `apps/server/src/controller/onboarding.controller.ts`
- `apps/server/package.json`

Server changes:

- Added `multer` for multipart resume upload.
- Resume uploads are stored under `~/.iprep/docs/<document-id>/original.<ext>`.
- Metadata is stored in the existing `Note` table.
- `POST /api/v1/onboarding/provider/test` now returns frontend-friendly fields: `ok`, `status`, `testPassed`, `message`.
- `GET /api/v1/onboarding` now returns top-level onboarding fields for frontend fallback.

## Shared/DB Progress

Shared schema updated:

- `packages/shared/src/schemas/onboarding.schema.ts`

Schema now accepts:

- `goalTypes`
- optional `modelName`
- provider mode in frontend form: `CLI` / `API_KEY`
- provider mode in server form: `cli` / `api_key`

DB query added:

- `packages/db/src/queries/document.query.ts`

DB barrel updated:

- `packages/db/src/index.ts`

## Verification

Passed:

```bash
corepack pnpm build
```

This built:

- `@iprep/shared`
- `@iprep/db`
- `@iprep/server`
- `@iprep/frontend`
- `iprep` CLI bundle

Earlier frontend-only checks also passed:

```bash
corepack pnpm --filter @iprep/frontend build
corepack pnpm --filter @iprep/frontend lint
```

GitNexus `detect_changes` after server work reported medium risk because onboarding controller/schema changes affect provider test and onboarding status flows. No HIGH or CRITICAL risk was reported.

## Current Known Gaps

- Need real end-to-end manual test with local server running and frontend open.
- Need server-side provider test commands finalized for Codex and Gemini CLI.
- `goalTypes` is accepted by schema but not stored in a dedicated DB column yet.
- `modelName` is accepted by schema but not persisted in `ProviderCredential` yet.
- Resume metadata uses the existing `Note` table as a first-version document store.
- Markdown conversion for uploaded PDF/DOCX is not implemented yet; conversion status is returned as `queued`.
- `GET /api/v1/providers` and settings APIs are still future work.

## Suggested Next Session Steps

1. Start server and frontend together.
2. Manually test first-visit onboarding from browser.
3. Fix any request/response shape mismatch found during manual test.
4. Add DB fields for `goalTypes` and provider `modelName` if persistent structured storage is required now.
5. Add focused tests for onboarding API and frontend first-time detection.
6. Implement dashboard data endpoints after onboarding works end to end.
