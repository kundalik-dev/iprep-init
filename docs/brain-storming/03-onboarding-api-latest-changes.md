---
name: Onboarding API latest changes
description: Summary of recent onboarding and profile API implementation updates, schema changes, and behavior impact.
---

# Onboarding API Latest Changes

## File added

- File name: `docs/brain-storming/03-onboarding-api-latest-changes.md`
- Purpose: Record what was recently implemented for onboarding/profile/provider flow in the local server.

## What was added or changed

### 1) New onboarding and profile API routes

Added these endpoints:

- `GET /api/v1/onboarding`
- `POST /api/v1/onboarding/profile`
- `POST /api/v1/onboarding/goal`
- `POST /api/v1/onboarding/provider/test`
- `POST /api/v1/onboarding/provider`
- `POST /api/v1/onboarding/complete`
- `GET /api/v1/user`
- `PATCH /api/v1/user`

Also moved old CRUD-style user routes to:

- `/api/v1/users` (list/get-by-id/create/update/delete)

### 2) Onboarding persistence in database

Prisma schema now includes:

- `User` onboarding-related fields: `goal`, `resumeDocumentId`, `onboardingStep`, `isOnboardingComplete`
- `UserOnboarding` table for progress persistence across app restarts
- `ProviderCredential` table for provider mode, key metadata, test status, and selection state
- New enums: `ProviderMode` (`CLI`, `API_KEY`) and `OnboardingStep` (`PROFILE`, `GOAL`, `PROVIDER`, `COMPLETE`)

### 3) Provider mode support

Two provider modes are supported:

- CLI mode: `claude`, `codex`, `gemini`
- API key mode: `claude`, `codex`, `gemini`, `ollama`, `openrouter`

Validation was added to enforce valid provider/mode combinations.

### 4) Provider test workflow

- `POST /onboarding/provider/test` runs a pre-save test.
- CLI mode checks CLI availability (`--version` call).
- API key mode currently validates key format (non-empty/length).
- `POST /onboarding/provider` requires test pass before storing as working.

### 5) Secure key handling

For API-key mode:

- Key is hashed using `bcryptjs` (`apiKeyHash`) for secure fingerprinting.
- Key is also encrypted (`apiKeyCiphertext`, `apiKeyIv`, `apiKeyAuthTag`) for runtime use.
- Decryption helper is available for adapter/runtime fetch use.

Note: bcrypt alone is one-way and cannot be decrypted, so encryption is also required.

### 6) Local single-user behavior

- Added fixed local user identity handling via `LOCAL_USER_ID = "local_user"` in onboarding query layer.
- Ensures all onboarding/profile operations target a single local profile in current local-only architecture.

## What happens because of these changes

- Onboarding progress now persists if user skips and revisits later.
- User cannot mark onboarding complete unless required steps are satisfied (or skip flow is explicitly allowed).
- Provider setup now supports both CLI-based and API-key-based configuration paths.
- Provider “working/default/last test” state is tracked in DB and returned in API responses.
- Sensitive API keys are no longer stored raw; only hashed+encrypted forms are persisted.
- API contract becomes closer to `docs/brain-storming/api-requirements.md` for onboarding and user profile flows.
