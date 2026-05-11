---
name: Docs File Log
description: Index of every file in the docs/ folder with one-line descriptions organized by subfolder. Always check this file first to find the right document without opening everything.
---

# docs/ - File Log

> Last updated: 2026-05-11
> Index of every file in the `docs/` folder. Keep this up to date when files are added, renamed, or removed.

---

## architecture/

Architecture notes and system design documents. This folder currently has no tracked files.

---

## Root docs files

Top-level documentation files for navigating the `docs/` folder.

| File        | Description                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md` | Docs folder guide with folder structure, documentation conventions, and cross-references to other `CLAUDE.md` files. |
| `log.md`    | This file; the maintained index of files in the `docs/` folder.                                                      |

---

## brain-storming/

Early product thinking, rough workflows, and discussion notes before ideas become implementation plans.

| File                                           | Description                                                                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `00-iprep-main-pages.md`                       | Brainstorming map of the main iPrep UI pages, including dashboard, interviews, history, AI coach, notes, communication, analysis, and settings. |
| `01-iprep-onboarding-and-first-interview.md`   | Brainstorming document for the iPrep first-run onboarding journey, interview creation paths, and post-session analysis flow.                    |
| `02-iprep-system-design-and-wrokflow.md`       | Brainstorming document for the iPrep system design, monorepo layers, local `.iprep` workspace, package responsibilities, and workflow pipeline. |
| `api-requirements.md`                          | Future-facing API requirements for the local iPrep server, synthesized from brainstorming docs and demo app API requirements.                   |
| `iprep-brainstorm-api.postman_collection.json` | Postman collection for the future local iPrep API routes defined in `api-requirements.md`.                                                      |

---

## CLI/

Planning and design documents for the iPrep CLI (`apps/cli`).

| File                       | Description                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `01-cli-plan.md`           | Master CLI plan - stack, folder structure, all commands, utilities, local home structure, and implementation phases. Primary reference for CLI design. |
| `02-onboard-plan.md`       | Detailed plan for the `iprep onboard` command - 7-step flow, inputs, outputs, and handler design (`runOnBoard`).                                       |
| `03-start-command.plan.md` | Detailed plan for the `iprep start` command - prerequisite checks, server spawn, health wait, and handler design (`runStart`).                         |

---

## DB/

Database schema notes and Prisma model drafts.

| File                        | Description                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `01-prisma-schema.md`       | Initial Prisma schema draft covering users, interviews, notes, chats, transcripts, analysis, feedback, and enums. |
| `02-prisma.schema-codex.md` | Alternate Codex-generated Prisma schema draft for the iPrep interview coach data model.                           |

---

## demo-app/

Early-stage prototype HTML apps and API design docs used before the Vite frontend was built. Reference only - not active development.

### demo-app/app-docs/

| File                     | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `CLAUDE.md`              | Claude instructions scoped to the `demo-app/app-docs/` subfolder.                |
| `01-plan.md`             | Demo app feature plan - three new feature areas planned for the iPrep prototype. |
| `02-feature.md`          | Feature specification details for the demo app.                                  |
| `03-api-requirements.md` | API requirements document for the demo app backend integration.                  |
| `api-requirements.html`  | HTML-rendered version of the API requirements document.                          |

### demo-app/claude-iprep-html/

Static HTML prototype of the iPrep UI generated with Claude. Reference only.

| File             | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `index.html`     | Main HTML page for the Claude-generated iPrep prototype.               |
| `app.js`         | Client-side JavaScript for the Claude prototype.                       |
| `style.css`      | Styles for the Claude prototype.                                       |
| `mock-data.json` | Mock JSON data used by the Claude prototype to simulate API responses. |

### demo-app/codex-iprep-html/

Static HTML prototype of the iPrep UI generated with Codex. Reference only.

| File             | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `index.html`     | Main HTML page for the Codex-generated iPrep prototype.               |
| `app.js`         | Client-side JavaScript for the Codex prototype.                       |
| `style.css`      | Styles for the Codex prototype.                                       |
| `mock-data.json` | Mock JSON data used by the Codex prototype to simulate API responses. |

### demo-app/postman/

| File                                     | Description                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `iprep-demo-api.postman_collection.json` | Postman collection for testing the iPrep demo API endpoints. Import into Postman to run manual API tests. |

---

## learning/

Developer reference guides and learning notes. Not project planning - these are how-to and background reading.

| File                           | Description                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `prettier-eslint-guide.md`     | ESLint and Prettier setup guide for the iPrep monorepo - explains the linting/formatting toolchain and how to configure it. |
| `cli-learning/cli-learning.md` | CLI development learning notes - reference material gathered while building the `iprep` CLI.                                |

---

## project-rules/

Coding conventions, AI contribution guidelines, and git workflow rules. Apply to all contributors and AI assistants.

| File                    | Description                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `README.md`             | Entry point for all project rules - index and overview of the rules in this folder. Read this first.              |
| `AI_RULES.md`           | Guidelines for AI-assisted contributions to iPrep - how Claude and other AI tools should behave in this codebase. |
| `NAMING_CONVENTIONS.md` | Naming rules for variables, functions, files, folders, and markdown documents across the monorepo.                |

### project-rules/github-rules/

| File                     | Description                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `GIT_BRANCH_WORKFLOW.md` | Git branching strategy - branch naming, when to branch, merge vs rebase, and PR rules.         |
| `GIT_COMMIT_INFO.md`     | Git commit message conventions - format, prefixes, scope, and examples for iPrep commits.      |
| `GIT_REBASE_INFO.md`     | Git rebase guidelines - when to rebase, how to handle conflicts, and interactive rebase usage. |

---

## tasks/

Task breakdowns and implementation tracking notes. This folder currently has no tracked files.

---

## testing/

Manual test plans, issue logs, and CLI testing notes.

| File                | Description                                                                            |
| ------------------- | -------------------------------------------------------------------------------------- |
| `01-cli-testing.md` | CLI manual testing log - issues found during CLI testing sessions, started 2026-05-11. |
