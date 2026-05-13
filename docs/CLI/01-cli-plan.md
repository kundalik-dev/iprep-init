---
name: CLI Plan
description: Master CLI plan — stack, folder structure, all commands, utilities, local iPrep home structure, and implementation phases. Primary reference for CLI design.
---

# iPrep CLI Plan

> Last updated: 2026-05-11
> Scope: CLI folder structure, files, libraries, commands, and expected outcomes.

---

## CLI Goal

The iPrep CLI is the user's local control panel. It should prepare the machine, manage local iPrep files, check provider readiness, start the backend/server, open the web app, and expose useful session/analysis/export commands from the terminal.

## CLI Stack

| Area                | Library / Package | Used For                                                                             |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| Runtime             | Node.js 20+       | Runs the published `iprep` command.                                                  |
| Language            | TypeScript        | Keeps commands, options, and utilities typed.                                        |
| Command framework   | `commander`       | Defines `iprep <command>` syntax, options, help text, and command dispatch.          |
| Terminal colors     | `chalk`           | Prints readable success, warning, error, and info messages.                          |
| Interactive prompts | `inquirer`        | Collects setup choices such as provider keys, default tutor, and preferences.        |
| ASCII banners       | `figlet`          | Renders the iPrep ASCII art banner on command entry.                                 |
| Gradient colors     | `gradient-string` | Applies purple gradient to the ASCII banner and separators.                          |
| Spinners            | `ora`             | Shows progress while checking CLIs, server status, DB setup, and provider readiness. |
| Browser opener      | `open`            | Opens the local web UI after `iprep start`.                                          |
| Logging             | `winston`         | Future structured CLI logs, especially for debug output and support bundles.         |
| Shared contracts    | `@iprep/shared`   | Reuses paths, constants, schemas, provider slugs, tutor slugs, and validation.       |
| Backend API         | Local HTTP calls  | CLI commands can call the local server for sessions, status, analysis, and exports.  |

## CLI Folder Structure

```text
apps/cli/
├── package.json                         # CLI package config, dependencies, scripts, and "iprep" bin mapping
├── tsconfig.json                        # TypeScript build config for compiling src/ into dist/
├── tsup.config.ts                       # tsup bundler config — bundles CLI + server into dist/
├── README.md                            # CLI package readme; should match the final v1 command shape
│
└── src/
    ├── index.ts                         # Commander root; registers commands and handles global errors
    │
    ├── commands/
    │   ├── index.ts                     # registerCommands(program) — wires all commands; no logic here
    │   ├── onboard.command.ts           # iprep onboard: 7-step first-time setup flow  ✓ implemented
    │   ├── start.command.ts             # iprep start: verifies setup then spawns server  ✓ implemented
    │   ├── status.command.ts            # iprep status: checks server health / env status  ✓ implemented
    │   ├── doctor.ts                    # iprep doctor: checks local readiness, DB, server, keys, and CLIs
    │   ├── setup.ts                     # iprep setup: interactive provider keys and preference wizard
    │   ├── sessions.ts                  # iprep sessions: lists recent interview sessions
    │   ├── analyze.ts                   # iprep analyze <sessionId>: triggers/reruns analysis
    │   ├── export.ts                    # iprep export <sessionId>: exports transcript and analysis
    │   └── keys.ts                      # iprep keys: manages BYOK provider key configuration
    │
    ├── handlers/
    │   ├── onboard.handler.ts           # runOnBoard(opts) — full onboard orchestration (7 steps)  ✓ implemented
    │   └── start.handler.ts             # runStart(opts) — verify prerequisites + spawn server  ✓ implemented
    │
    ├── services/
    │   ├── index.ts                     # Re-exports all services
    │   └── server-manager.ts            # isPortInUse, startServer, checkHealth helpers  ✓ implemented
    │
    ├── config/
    │   └── env.ts                       # Frozen re-export of ENV_VARS from @iprep/shared
    │
    └── utils/
        ├── index.ts                     # Re-exports all utilities
        ├── chalk-helper.ts              # log.*, printBanner, printSeparator, printCommandBadge, printMeta, printStep  ✓ implemented
        ├── fs.utils.ts                  # dirExists(path) helper  ✓ implemented
        ├── display.ts                   # Chalk output helpers: success, error, warn, info, headings
        ├── spinner.ts                   # Ora spinner wrapper for long-running CLI checks/actions
        ├── prompts.ts                   # Inquirer prompt helpers for setup and key management
        ├── home-dir.ts                  # ~/.iprep folder/config creation and lookup helpers
        ├── api.ts                       # Planned local backend HTTP client helper
        ├── process.ts                   # Planned process/server/provider CLI detection helper
        └── table.ts                     # Planned reusable terminal table formatting helper
```

## Command Files

| File                          | Command                     | Status  | What It Achieves                                                                                                                     |
| ----------------------------- | --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `commands/onboard.command.ts` | `iprep onboard`             | ✓ Done  | 7-step first-time setup: creates `~/.iprep/` dirs, writes `~/.iprep/.env`, runs DB migrations, verifies setup, prints summary.       |
| `commands/start.command.ts`   | `iprep start`               | ✓ Done  | Shows banner, verifies all prerequisites (dirs, DB, env), guards port, spawns server, waits for health check, shows running summary. |
| `commands/status.command.ts`  | `iprep status`              | ✓ Done  | Shows current server status, configured providers, installed CLIs, DB status, and recent readiness summary.                          |
| `commands/doctor.ts`          | `iprep doctor`              | Planned | Checks Node, pnpm/npm environment, iPrep home, database readiness, server availability, provider keys, and local CLIs.               |
| `commands/setup.ts`           | `iprep setup`               | Planned | Interactive setup wizard for API keys, default provider, tutor, mode, and local preferences.                                         |
| `commands/sessions.ts`        | `iprep sessions`            | Planned | Lists recent local interview sessions with status, tutor, package, duration, and analysis state.                                     |
| `commands/analyze.ts`         | `iprep analyze <sessionId>` | Planned | Triggers or reruns analysis for a completed session from the terminal.                                                               |
| `commands/export.ts`          | `iprep export <sessionId>`  | Planned | Exports transcript and analysis to Markdown first, with PDF later.                                                                   |
| `commands/keys.ts`            | `iprep keys`                | Planned | Manages BYOK provider keys or key metadata through local config/settings.                                                            |

## Utility Files

| File                    | Responsibility                                                                                                                                                | Status  | Used By                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------- |
| `utils/chalk-helper.ts` | `log.{success,error,info,warn,bold,dim,highlight}`, `printBanner()` (ANSI Shadow + gradient), `printSeparator`, `printCommandBadge`, `printMeta`, `printStep` | ✓ Done  | All commands                                      |
| `utils/fs.utils.ts`     | `dirExists(path)` — checks a path exists and is a directory.                                                                                                  | ✓ Done  | `onboard.handler`, `start.handler`                |
| `utils/display.ts`      | Terminal output helpers such as `success`, `error`, `warn`, `info`, section headers, and tables.                                                              | Planned | All commands                                      |
| `utils/spinner.ts`      | Small wrapper around `ora` for consistent loading states.                                                                                                     | Planned | `doctor`, `start`, `setup`, `analyze`, `export`   |
| `utils/prompts.ts`      | Reusable `inquirer` prompts for provider keys, default tutor, default mode, confirmation, and choices.                                                        | Planned | `onboard`, `setup`, `keys`                        |
| `utils/home-dir.ts`     | Creates and reads local iPrep directories and config files under the iPrep home path.                                                                         | Planned | `onboard`, `doctor`, `setup`, `keys`, `export`    |
| `utils/api.ts`          | Planned helper for local server HTTP requests.                                                                                                                | Planned | `status`, `sessions`, `analyze`, `export`, `keys` |
| `utils/process.ts`      | Planned helper for spawning/checking server and provider CLIs.                                                                                                | Planned | `doctor`, `start`, `status`                       |
| `utils/table.ts`        | Planned helper for clean table rendering without duplicating formatting logic.                                                                                | Planned | `doctor`, `status`, `sessions`                    |

## Local iPrep Home Structure

```text
~/.iprep/
├── .env                                 # Written by iprep onboard; PORT, NODE_ENV, DATABASE_URL, CORS_ORIGIN, API_BASE_URL
├── config.json                          # Created by setup; default tutor, provider, mode, server port
├── keys.json                            # Created by setup/keys; BYOK key metadata or encrypted key storage
├── sessions.json                        # Used by adapters; optional Claude/Gemini/Codex session mapping
│
├── database/
│   └── iprep.db                         # Local SQLite database created by DB setup/server startup
│
├── logs/
│   ├── cli-log/
│   │   └── cli-YYYY-MM-DD.log           # Daily CLI operation logs (commands run, errors, warnings)
│   └── server-log/
│       └── server-YYYY-MM-DD.log        # Daily server logs (requests, errors, startup/shutdown events)
│
├── sessions/
│   └── <session-id>/                    # Stored after each interview for future analysis/export/review
│
├── skills/
│   └── <skill-id>/                      # AI skill packs used by tutors/providers during sessions
│
├── docs/
│   └── <document-id>/                   # User-uploaded docs/resumes/JDs used as interview context
│
├── interview-data/
│   └── <session-id>/                    # Stored after each interview for future analysis/export/review
│       ├── recordings/                  # Audio recordings captured during the interview
│       ├── transcripts/                 # Raw and cleaned transcript files
│       ├── analysis/                    # Generated feedback, scores, and analysis snapshots
│       └── metadata.json                # Session package, tutor, provider, timing, and status metadata
│
├── exports/
│   └── <session-id>.md                  # Markdown exports from iprep export
│
└── backups/
    └── iprep-backup-YYYY-MM-DD.zip      # Future backup archive from iprep backup
```

## Command Behavior Plan

| Command                     | Inputs                                 | Output                                | Success Criteria                                                             |
| --------------------------- | -------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `iprep --help`              | None                                   | Command list and global options.      | All v1 commands appear with short descriptions.                              |
| `iprep onboard`             | Optional `--yes`                       | Created folder summary.               | `~/.iprep/` dirs and `.env` exist; DB migrated; setup verified.              |
| `iprep doctor`              | Optional `--json`                      | Readiness checklist.                  | Shows pass/fail for Node, local files, DB, server, keys, and CLIs.           |
| `iprep setup`               | Interactive answers                    | Saved config summary.                 | User can configure minimum provider settings without editing files manually. |
| `iprep status`              | Optional `--json`                      | Server/provider/DB status.            | Clearly shows whether the app is ready to start an interview.                |
| `iprep start`               | Optional `--port`, `--no-open`         | Server URL and startup state.         | Backend starts, `/health` passes, browser opens unless disabled.             |
| `iprep sessions`            | Optional `--limit`, `--json`           | Recent sessions table.                | User can identify a session ID for analysis/export.                          |
| `iprep analyze <sessionId>` | Session ID, optional `--provider`      | Analysis progress and result summary. | Completed session receives a stored analysis result.                         |
| `iprep export <sessionId>`  | Session ID, optional `--format md/pdf` | Export file path.                     | Transcript and analysis are written to `~/.iprep/exports/`.                  |
| `iprep keys`                | Subcommands or prompts                 | Provider key status.                  | User can add, update, remove, or inspect provider key configuration.         |

## Implementation Phases

| Phase | Focus               | Files                                                         | Done When                                                                     |
| ----- | ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1     | CLI shell           | `src/index.ts`, all command files                             | `iprep --help` shows all planned commands.                                    |
| 2     | Display utilities   | `utils/chalk-helper.ts`, `utils/spinner.ts`, `utils/table.ts` | Commands share consistent output formatting.                                  |
| 3     | Local home setup    | `commands/onboard.command.ts`, `handlers/onboard.handler.ts`  | `iprep onboard` creates the full local folder/config structure safely. ✓ Done |
| 4     | Server control      | `commands/start.command.ts`, `handlers/start.handler.ts`      | `iprep start` verifies setup, launches backend, server health passes. ✓ Done  |
| 5     | Readiness checks    | `commands/doctor.ts`, `utils/process.ts`                      | `iprep doctor` reports Node, iPrep home, DB, server, keys, and provider CLIs. |
| 6     | Interactive setup   | `commands/setup.ts`, `commands/keys.ts`, `utils/prompts.ts`   | User can configure provider keys and defaults from terminal prompts.          |
| 7     | Session commands    | `commands/status.ts`, `commands/sessions.ts`                  | CLI can read server/session status from the local API.                        |
| 8     | Analysis and export | `commands/analyze.ts`, `commands/export.ts`                   | CLI can trigger analysis and export results.                                  |

## CLI and Backend Relationship

| CLI Area   | Backend Dependency | Notes                                                                                      |
| ---------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `onboard`  | Low                | Can run before backend exists; prepares local folders, .env, and DB migrations.            |
| `start`    | High               | Verifies prerequisites, spawns server, waits for `/health`.                                |
| `doctor`   | Medium             | Checks backend availability but should still work when server is offline.                  |
| `setup`    | Low/medium         | Can write local config directly first; later can call settings API when server is running. |
| `status`   | High               | Best result comes from backend `/health` and provider status API.                          |
| `sessions` | High               | Reads session data from backend or DB query layer.                                         |
| `analyze`  | High               | Calls backend analysis endpoint or provider service.                                       |
| `export`   | Medium/high        | Can export via API once analysis/session APIs exist.                                       |

## Expected User Outcomes

| User Need             | CLI Support                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| First-time setup      | `iprep onboard` prepares local files, .env, and DB in one command.         |
| Daily launch          | `iprep start` verifies setup, starts the local app, and opens the browser. |
| Quick readiness check | `iprep status` confirms server, DB, and provider state.                    |
| Troubleshooting       | `iprep doctor` gives a readable checklist and next action hints.           |
| Session lookup        | `iprep sessions` shows recent interview sessions.                          |
| Terminal analysis     | `iprep analyze <sessionId>` runs analysis without opening the UI.          |
| Portability           | `iprep export <sessionId>` creates shareable transcript/feedback files.    |
| Provider management   | `iprep keys` and `iprep setup` manage BYOK configuration.                  |

## Notes

- `onboard` is the entry point for all first-time users — replaces the earlier `init` concept.
- `onboard`, `doctor`, and `setup` should work even when the backend server is not running.
- Commands that require session or analysis data should prefer the local backend API once it exists.
- CLI output should stay compact by default, with `--json` available for automation where useful.
- CLI logs go to `~/.iprep/logs/cli-log/`; server logs go to `~/.iprep/logs/server-log/` — both use daily rotation (`YYYY-MM-DD.log`).
