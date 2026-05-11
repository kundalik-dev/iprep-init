---
name: Docs Folder Guide
description: Claude instructions for the docs/ folder - structure overview, cross-references to all CLAUDE.md files across the monorepo, and docs conventions. Check log.md for current file index.
---

# iPrep - docs/

This folder holds planning, brainstorming notes, learning references, rules, testing notes, database drafts, and demo assets for the iPrep project. It is documentation-only; no source code lives here.

## How to use this folder

**Always check [`docs/log.md`](./log.md) first.** It is the index of every file in this folder, organized by subfolder, with a one-line description of each file. Use it to quickly find the right document without opening everything.

Use [`brain-storming/`](./brain-storming/) for early product thinking, rough workflow design, and exploratory ideas that are not yet implementation plans.

When reviewing product brainstorming notes, start with [`brain-storming/00-iprep-main-pages.md`](./brain-storming/00-iprep-main-pages.md) for the page map, then read the numbered workflow notes that follow.

## Folder Structure

```
docs/
|-- CLAUDE.md               <- this file - folder guide and cross-references
|-- log.md                  <- index of all files with descriptions (check this first)
|
|-- architecture/           <- architecture notes and system design docs
|-- brain-storming/         <- early product ideas, rough workflows, and discussion notes
|-- CLI/                    <- CLI command planning and design docs
|-- DB/                     <- database schema notes and Prisma model drafts
|-- demo-app/               <- prototype HTML apps and API docs used for early design
|-- learning/               <- developer reference guides and learning notes
|-- project-rules/          <- coding conventions, AI rules, git workflow rules
|-- tasks/                  <- task breakdowns and implementation tracking notes
`-- testing/                <- test plans, issue logs, and manual testing notes
```

## Cross-references to other CLAUDE.md files

Each package and app has its own `CLAUDE.md` with tactical implementation details. This `docs/CLAUDE.md` is documentation-scoped only.

| CLAUDE.md location                                                  | Scope                                                                         |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`/CLAUDE.md`](../CLAUDE.md)                                        | Root - monorepo architecture, stack, package graph, dev commands, conventions |
| [`apps/cli/CLAUDE.md`](../apps/cli/CLAUDE.md)                       | CLI - commands, handlers, services, utils, conventions                        |
| [`apps/server/CLAUDE.md`](../apps/server/CLAUDE.md)                 | Server - routes, controllers, env config, conventions                         |
| [`packages/shared/CLAUDE.md`](../packages/shared/CLAUDE.md)         | Shared - env loading, paths, formatters, schema conventions                   |
| [`packages/db/CLAUDE.md`](../packages/db/CLAUDE.md)                 | DB - Prisma schema, migrations, query functions, conventions                  |
| [`docs/demo-app/app-docs/CLAUDE.md`](./demo-app/app-docs/CLAUDE.md) | Demo app docs subfolder guide                                                 |

## Conventions for this folder

- Each subfolder has a purpose; do not mix planning docs into `learning/`, or rules into `CLI/`.
- File names use kebab-case; numbered files (`01-`, `02-`) indicate a reading sequence
- Keep `log.md` up to date whenever a file is added, renamed, or removed from this folder
- Keep early, unfinished product ideas in `brain-storming/` until they are ready to become implementation plans
- Do not add source code (`.ts`, `.js`) to this folder; use the relevant `apps/` or `packages/` location
