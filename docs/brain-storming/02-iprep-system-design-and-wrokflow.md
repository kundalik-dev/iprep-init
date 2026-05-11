---
name: iPrep system design and workflow pipeline
description: Brainstorming notes for the iPrep system design, workflow pipeline, local folder structure, and tech stack.
---

# iPrep System Design And Workflow Pipeline

This document explains the planned iPrep system shape: the monorepo layers, local `.iprep` workspace, package responsibilities, and the normal workflow from onboarding to interview analysis.

It is a brainstorming document. Treat it as the current product and architecture direction, not as a locked implementation contract.

## High-Level Structure

iPrep is planned as a pnpm monorepo with three main areas:

- apps
- packages
- docs

### Apps Layer

The `apps/` layer contains user-facing and runtime applications.

| App        | Responsibility                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `frontend` | Browser UI for dashboards, interviews, notes, settings, history, AI Coach, and analysis views.                                  |
| `server`   | Local API layer that connects the frontend, database, CLI, file system, and AI adapters.                                        |
| `cli`      | npm-published CLI used for onboarding, starting the local server, checking health, exporting data, and running local workflows. |

### Packages Layer

The `packages/` layer contains reusable modules shared across apps.

| Package    | Responsibility                                                                         |
| ---------- | -------------------------------------------------------------------------------------- |
| `shared`   | Shared schemas, types, constants, config helpers, path helpers, and utility functions. |
| `db`       | SQLite/Prisma access layer for reading and writing local application data.             |
| `adapters` | Provider-specific integrations for AI tools and APIs.                                  |

Potential adapter targets:

- Claude Code
- Gemini
- Codex
- OpenRouter or other hosted APIs
- Local providers
- BYOK API key providers

### Docs Layer

The `docs/` layer contains planning, brainstorming, architecture notes, rules, and testing references. It should not contain application source code.

## Install And Onboarding Workflow

The iPrep CLI will be published from the `apps/cli` package to npm. A new user should be able to start setup with:

```bash
npx iprep onboard --yes
```

The onboarding command should:

1. Create the local `.iprep` folder structure.
2. Create or migrate the local database.
3. Write required config files.
4. Start the local server on port `5545`.
5. Connect the browser UI to the local server.
6. Continue the first-run onboarding flow in the frontend.

For the detailed first-run flow, see [`01-iprep-onboarding-and-first-interview.md`](./01-iprep-onboarding-and-first-interview.md).

Open product decision:

- Decide whether the frontend is hosted on Vercel and connects to the local server, or ships with the CLI and runs locally.

## .iprep folder structure

The `.iprep` folder should be created in the user's home directory, such as:

```text
C:\Users\<username>\.iprep
```

This folder stores local app state, configuration, logs, uploaded documents, interview data, exports, and backups.

Planned structure:

```
~/.iprep/
|-- .env                                 # Written by iprep onboard; PORT, NODE_ENV, DATABASE_URL, CORS_ORIGIN, API_BASE_URL
|-- config.json                          # Created by setup; default tutor, provider, mode, server port
|-- keys.json                            # Created by setup/keys; BYOK key metadata or encrypted key storage
|-- sessions.json                        # Used by adapters; optional Claude/Gemini/Codex session mapping
|
|-- database/
|   `-- iprep.db                         # Local SQLite database created by DB setup/server startup
|
|-- logs/
|   |-- cli-log/
|   |   `-- cli-YYYY-MM-DD.log           # Daily CLI operation logs (commands run, errors, warnings)
|   `-- server-log/
|       `-- server-YYYY-MM-DD.log        # Daily server logs (requests, errors, startup/shutdown events)
|
|-- sessions/
|   `-- <session-id>/
|       |-- metadata.json                 # Session package, tutor, provider, timing, status, and selected context
|       |-- transcript.raw.json           # Raw transcript from the voice/chat provider
|       |-- transcript.md                 # Cleaned transcript for user review and export
|       |-- analysis.json                 # Structured analysis, scores, strengths, and improvement areas
|       |-- analysis.md                   # Human-readable analysis report
|       `-- recording.webm               # Audio/video recording when available
|
|-- skills/
|   `-- <skill-id>/                      # AI skill packs used by tutors/providers during sessions
|
|-- docs/
|   `-- <document-id>/
|       |-- original.<ext>                # Original uploaded resume, notes, PDF, or job description
|       |-- content.md                    # Markdown version used as AI context
|       `-- metadata.json                # File source, type, tags, upload date, and parsing status
|
|-- exports/
|   |-- sessions/
|   |   `-- <session-id>.md              # Markdown exports from iprep export
|   `-- backups/
|       `-- iprep-export-YYYY-MM-DD.zip  # User-created export bundle
|
`-- backups/
    `-- iprep-backup-YYYY-MM-DD.zip      # Future backup archive from iprep backup
```

## Package And App Structure References

For detailed structure of individual apps and packages, use the dedicated planning documents:

- [`docs/CLI/01-cli-plan.md`](../CLI/01-cli-plan.md)
- Frontend structure document - to be added
- Server structure document - to be added
- Shared package structure document - to be added
- DB package structure document - see [`docs/DB/01-prisma-schema.md`](../DB/01-prisma-schema.md)
- Adapters package structure document - to be added

## System Responsibilities

iPrep should keep responsibilities separated so each layer stays clear.

### CLI

The CLI should:

- Onboard the user
- Start and stop the local server
- Check app status and health
- Initialize or repair local folders
- Initialize or migrate the local database
- Read session data when needed
- Export reports, transcripts, and backups
- Trigger local analysis through configured adapters when supported

### Server

The server should:

- Communicate with the frontend
- Use the `db` package for database operations
- Read and write files inside the `.iprep` workspace
- Coordinate interview sessions
- Trigger AI adapter workflows after interviews
- Return dashboard, history, notes, settings, transcript, and analysis data to the frontend

Some functionality is still open, especially how much analysis orchestration should live in the server versus the CLI.

### Frontend

The frontend should:

- Provide the main user experience
- Connect to the local server
- Show dashboards, interviews, history, notes, communication insights, settings, and analysis pages
- Guide onboarding and first-run setup
- Let users manage context files and API settings
- Display interview progress and post-session analysis

### Shared

The `shared` package should provide:

- Common types
- Validation schemas
- Constants
- Path helpers
- Formatting helpers
- Shared config utilities

### DB

The `db` package should:

- Own Prisma and SQLite access
- Provide read/write functions
- Avoid business logic where possible
- Keep persistence concerns separate from server and CLI workflows

### Adapters

The adapters package should:

- Wrap provider-specific AI behavior
- Support multiple providers over time
- Keep provider details outside the server and frontend
- Handle session mapping when providers expose external session IDs

## Security And Configuration Notes

iPrep will need to store user settings and API keys. The exact storage method is not finalized yet.

Open security decisions:

- Whether API keys are encrypted, hashed, stored in OS credential storage, or stored in local config with strong warnings
- How to separate public config from sensitive config
- Whether `keys.json` stores raw keys, encrypted keys, or only metadata
- How to rotate, remove, and validate provider keys safely

The default direction should be to keep sensitive values local, avoid sending them to hosted services unless required by the selected provider, and make key usage visible to the user.

## Normal Workflow Pipeline

The expected happy path is:

1. User runs `npx iprep onboard --yes`.
2. CLI creates the `.iprep` workspace.
3. CLI initializes the database and config files.
4. CLI starts the local server on port `5545`.
5. Frontend connects to the local server.
6. User completes browser onboarding.
7. User starts an interview.
8. Server stores session metadata and streams or saves interview data.
9. AI adapter generates transcript, analysis, and feedback after the session.
10. Server stores analysis in the database and session files.
11. Frontend shows the completed report, history entry, and improvement suggestions.
