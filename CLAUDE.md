# iPrep - an Interview Preparation Platform

## Project

A public opensource TypeScript monorepo for iPrep — an interview preparation platform with a shared package layer, Express API server, and CLI tool managed via pnpm workspaces and Turborepo.

## Stack

- TypeScript 6, NodeNext ESM
- Express 5 (server), Commander.js (CLI), Vite (frontend)
- Zod 4 for env/schema validation
- Prisma 7 + SQLite (dev), via `@iprep/db`
- pnpm workspaces + Turborepo
- `tsx` for dev execution, `tsc` for builds

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

## Package Dependency Graph

```
shared       ← no internal deps
db           ← shared only
llm-adapters ← shared only (planned)
server       ← shared, db, llm-adapters
cli          ← shared, llm-adapters (planned)
frontend     ← shared only (planned)
```

## Dev Commands

```bash
pnpm install                      # install and link all workspace deps
pnpm build                        # build all packages in dep order (Turbo)
pnpm dev                          # start all apps in watch mode
pnpm --filter=@iprep/server dev   # run only the server
pnpm db:generate                  # regenerate Prisma client after schema changes
pnpm db:migrate                   # run pending migrations
```

## Conventions

- All packages extend `../../tsconfig.base.json` — never duplicate compiler options
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
- Don't add any LLM provider SDK outside `packages/llm-adapters`
- Don't use `any` — use `unknown` and narrow

## Current Focus

Setting up the monorepo foundation: shared env loading, server routes, and build pipeline.
Active packages: `@iprep/shared` (env, paths, formatters) and `@iprep/server` (Express routes, config).
All three packages build clean. Next: fleshing out server routes and DB queries.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **iprep-init** (2258 symbols, 3713 relationships, 157 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/iprep-init/context` | Codebase overview, check index freshness |
| `gitnexus://repo/iprep-init/clusters` | All functional areas |
| `gitnexus://repo/iprep-init/processes` | All execution flows |
| `gitnexus://repo/iprep-init/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
