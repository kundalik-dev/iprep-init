# iPrep - an Interview Preparation Platform

## Project

A public opensource TypeScript monorepo for iPrep — an interview preparation platform with a shared package layer, Express API server, and CLI tool managed via pnpm workspaces and Turborepo.

## Stack

- TypeScript 6, NodeNext ESM
- Express 5 (server), Commander.js (CLI), Vite + React (frontend)
- Zod 4 for env/schema validation
- Prisma 7 + SQLite (dev), via `@iprep/db`
- pnpm workspaces + Turborepo
- `tsx` for dev execution, `tsc` for builds
- Local AI adapter scaffolding for provider-specific CLI/API execution

## Structure

Each package and app has its own `CLAUDE.md` with tactical details. This file is the architectural parent.

```
apps/
  server/       — Express 5 REST API               → see apps/server/CLAUDE.md
  cli/          — Commander.js CLI (planned)        → see apps/cli/CLAUDE.md (when added)
  frontend/     — Vite React app (planned)          → see apps/frontend/CLAUDE.md (when added)

packages/
  shared/       — Constants, schemas, utils barrel  → see packages/shared/CLAUDE.md
  db/           — Prisma client + queries           → see packages/db/CLAUDE.md
  llm-adapters/ — LLM provider wrappers (planned)  → see packages/llm-adapters/CLAUDE.md (when added)

tsconfig.base.json  — Root TS config (ES2022, NodeNext, strict, declaration)
turbo.json          — Turborepo pipeline config
.env                — Root env file; loaded by @iprep/shared at runtime
```

## Current Structure

The older tree above may lag behind active work. Treat this section as the current source of truth.

```
apps/
  server/       - Express 5 REST API
  cli/          - Commander.js CLI
  frontend/     - Vite React app

packages/
  shared/        - constants, schemas, path utilities, formatters
  db/            - Prisma schema, generated client, query layer
  adapter-utils/ - shared AI adapter contracts and process helpers
  adapters/
    codex-local/ - first iPrep-native adapter scaffold using type key `codex_local`

ai-adapter/
  codex-local/ - reference Paperclip-style Codex adapter source used for design guidance
```

## Package Dependency Graph

```
shared       ← no internal deps
db           ← shared only
llm-adapters ← shared only (planned)
server       ← shared, db, llm-adapters
cli          ← shared, llm-adapters (planned)
frontend     ← shared only (planned)
```

Current package dependency graph:

```
shared        <- no internal deps
db            <- shared only
adapter-utils <- no internal deps
adapters/*    <- adapter-utils
server        <- shared, db
cli           <- shared
frontend      <- app-local API clients and shared contracts as needed
```

## Dev Commands

```bash
pnpm install                      # install and link all workspace deps
pnpm build                        # build all packages in dep order (Turbo)
pnpm dev                          # start all apps in watch mode
pnpm --filter=@iprep/server dev   # run only the server
pnpm --filter=@iprep/frontend dev # run only the frontend
pnpm --filter=@iprep/adapter-utils build
pnpm --filter=@iprep/adapter-codex-local build
pnpm db:generate                  # regenerate Prisma client after schema changes
pnpm db:migrate                   # run pending migrations
```

## Recent Achievements

- Frontend chat UX now shows optimistic user messages immediately while AI responses are loading.
- Chat loading state now uses rhythmic typing dots instead of a card spinner.
- Codex CLI prompt execution was hardened to pass free-form chat text through stdin rather than shell arguments.
- `packages/adapter-utils` was added as the shared adapter contract/helper package.
- `packages/adapters/codex-local` was added as the first iPrep-native adapter scaffold using the `codex_local` type key.
- Prisma schema now includes `AiChatSession` design for per-user, per-chat, per-provider/model session state.

## Conventions

- All packages extend `../../tsconfig.base.json` — never duplicate compiler options
- Add a short, user-friendly comment above every new function explaining what it does in one plain sentence.
- Nested adapter packages under `packages/adapters/*` extend `../../../tsconfig.base.json`.
- Adapter packages should expose metadata from `src/index.ts` and server entrypoints from `src/server/index.ts`.
- Provider/session continuity belongs in adapter session state, not scattered through controller logic.
- Always use `.js` extension in relative imports (NodeNext ESM requirement)
- Use `path.dirname(fileURLToPath(import.meta.url))` for `__dirname` in ESM
- Import from package barrels only — `import { x } from '@iprep/shared'`, never deep paths
- `EnvSchema` is always pure (no `.default()`) — defaults live in `env.constants.ts` only
- Env loading: no `.env` → use DEFAULTS; `.env` exists but fields missing → exit with named errors
- Package scope is `@iprep/`; workspace deps declared as `"workspace:*"`
- Named exports only in `packages/` — no default exports
- Each package has its own `CLAUDE.md` — keep this root file architectural only

## Don'ts

- Don't use `ts-node` — use `tsx`; ts-node doesn't support NodeNext ESM or TypeScript 6
- Don't use deep package imports (`@iprep/shared/utils/formatters.js`) — use the barrel
- Don't add `.default()` to `EnvSchema` fields — breaks the missing-field error logic
- Don't import `@prisma/client` in apps — only through `@iprep/db`
- Don't add dependencies to root `package.json` except dev tooling (turbo, eslint, prettier, husky)
- Don't add provider-specific execution logic directly to controllers; place it in adapter packages or adapter-facing utilities
- Don't store provider-specific session state as one-off columns when a structured adapter session record is more flexible
- Don't use `any` — use `unknown` and narrow

## Current Focus

Stabilizing AI chat execution and session continuity.
Active areas: `@iprep/server` chat orchestration, `@iprep/db` chat/session persistence, `@iprep/adapter-utils`, and `@iprep/adapter-codex-local`.
Next: generate/apply the Prisma migration for `AiChatSession`, add query helpers, and wire `codex_local` into chat execution.

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **iprep-init** (1405 symbols, 2543 relationships, 111 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/iprep-init/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool             | When to use                   | Command                                                                 |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `query`          | Find code by concept          | `gitnexus_query({query: "auth validation"})`                            |
| `context`        | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})`                              |
| `impact`         | Blast radius before editing   | `gitnexus_impact({target: "X", direction: "upstream"})`                 |
| `detect_changes` | Pre-commit scope check        | `gitnexus_detect_changes({scope: "staged"})`                            |
| `rename`         | Safe multi-file rename        | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher`         | Custom graph queries          | `gitnexus_cypher({query: "MATCH ..."})`                                 |

## Impact Risk Levels

| Depth | Meaning                               | Action                |
| ----- | ------------------------------------- | --------------------- |
| d=1   | WILL BREAK — direct callers/importers | MUST update these     |
| d=2   | LIKELY AFFECTED — indirect deps       | Should test           |
| d=3   | MAY NEED TESTING — transitive         | Test if critical path |

## Resources

| Resource                                    | Use for                                  |
| ------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/iprep-init/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/iprep-init/clusters`       | All functional areas                     |
| `gitnexus://repo/iprep-init/processes`      | All execution flows                      |
| `gitnexus://repo/iprep-init/process/{name}` | Step-by-step execution trace             |

## Self-Check Before Finishing

Before completing any code modification task, verify:

1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
