# CLAUDE.md — Project Context for AI Assistance

## What This Project Is

A TypeScript monorepo managed with pnpm workspaces and Turborepo.
Apps consume internal packages via workspace references.
No package is published to npm — all private.

## Repo Structure

\```
apps/
cli/ — Commander.js CLI tool, bin entry at src/index.ts
frontend/ — Next.js app, uses Bundler moduleResolution
server/ — Express API, REST routes under src/routes/

packages/
shared/ — Types, constants, utility functions. No side effects.
db/ — Prisma client only. All DB access goes through here.
llm-adapters/ — Thin wrappers per LLM provider. Uniform interface.
\```

## Package Import Rules

- Apps can import from packages. Never the reverse.
- Apps must not import from other apps.
- `packages/shared` has zero dependencies on other internal packages.
- `packages/db` may import from `packages/shared` only.
- `packages/llm-adapters` may import from `packages/shared` only.

\```
shared ← no internal deps
db ← shared only
llm-adapters ← shared only
server ← db, shared, llm-adapters
cli ← shared, llm-adapters
frontend ← shared only (no db, no llm-adapters directly)
\```

## TypeScript Rules

- Root `tsconfig.base.json` is the source of truth for compiler options.
- All packages extend it with `"extends": "../../tsconfig.base.json"`.
- `module: NodeNext` for all Node packages (cli, server, all packages/).
- `module: ESNext` + `moduleResolution: Bundler` for frontend only.
- Always include `.js` extension in relative imports in Node packages.
- Never use `tsconfig.build.json` — keep tests outside `src/` instead.

## Code Style

- Prettier config at root `.prettierrc` — do not add per-package overrides.
- ESLint config at root — frontend may extend with eslint-config-next.
- No default exports in packages/ — named exports only.
- No barrel files (`index.ts` that re-exports everything) unless intentional.

## Database Rules

- All DB access through `@myrepo/db` — never import `@prisma/client` directly.
- Schema lives at `packages/db/prisma/schema.prisma`.
- After any schema change: run `pnpm db:generate` before anything else.
- Migration names should be descriptive: `add_user_roles` not `migration1`.

## LLM Adapter Rules

- Every provider adapter must export the same interface defined in `packages/shared`.
- No provider SDK leaks outside `packages/llm-adapters`.
- Ollama adapter is the local/free fallback — always keep it working.

## Adding New Code

When adding a new feature:

1. Types/interfaces → `packages/shared` first
2. DB schema changes → `packages/db`, then `pnpm db:generate`
3. LLM logic → `packages/llm-adapters`
4. Business logic → the relevant app

## Commands Reference

\```bash
pnpm dev # start all in dev mode
pnpm build # build all (respects dependency order via Turbo)
pnpm db:generate # after any Prisma schema change
pnpm --filter=@myrepo/server dev # run one app only
\```

## What to Avoid

- Do not restructure working package boundaries without asking.
- Do not add dependencies to root package.json except dev tooling.
- Do not add `any` types — use `unknown` and narrow.
- Do not install `@prisma/client` in apps — only in `packages/db`.
- Do not add a new LLM provider SDK to any app — only to `packages/llm-adapters`.

## Rules about other CLAUDE.md file for other places

Per-package CLAUDE.md should cover:

- What this package's single responsibility is
- What it exports and what it doesn't
- Key patterns used inside it
- What not to change without broader impact

Keep root CLAUDE.md architectural. Keep package CLAUDE.md tactical.
