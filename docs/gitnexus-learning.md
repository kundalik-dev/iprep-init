# GitNexus Learning Guide

GitNexus is a local code intelligence index for this project. It scans the repo and builds a graph of files, functions, imports, calls, relationships, and execution flows.

For this iPrep monorepo, GitNexus is useful because the code is split across:

- `apps/cli`
- `apps/server`
- `packages/shared`
- `packages/db`

Instead of only searching text, GitNexus helps answer questions like:

- How does this feature flow through the codebase?
- What calls this function?
- What will break if I change this file?
- Why is this function returning the wrong result?
- Which files are affected by my current changes?

## Important

GitNexus creates local index files inside:

```bash
.gitnexus/
```

This folder is ignored in `.gitignore`, so it should not be pushed to GitHub.

## Basic Commands

Check whether the project is indexed:

```bash
npx gitnexus status
```

Create or refresh the index:

```bash
npx gitnexus analyze
```

Force a full re-index:

```bash
npx gitnexus analyze --force
```

Remove the local GitNexus index:

```bash
npx gitnexus clean
```

Generate wiki-style documentation from the index:

```bash
npx gitnexus wiki
```

Use `analyze` after major refactors, new packages, renamed files, or when GitNexus says the index is stale.

## When To Use GitNexus

Use GitNexus when you need code understanding, debugging, refactoring, or impact analysis.

### 1. Understand A Feature

Use when you ask:

```text
How does iprep onboard work?
```

GitNexus can help trace:

```text
command -> handler -> env writing -> DB migration -> setup verification
```

Good prompts:

```text
Use GitNexus and explain how onboard command works.
```

```text
Use GitNexus to trace the start command flow.
```

```text
Use GitNexus to explain how CLI commands are registered.
```

### 2. Debug Bugs

Use when something behaves wrongly.

Example:

```text
Why does checkHealth always return false?
```

GitNexus helps find related code:

- `server-manager.ts`
- `status.handler.ts`
- server health routes
- env config
- DB health query

Good prompts:

```text
Use GitNexus to trace why checkHealth returns false.
```

```text
Use GitNexus to debug why checkDbHealth fails.
```

```text
Use GitNexus to find where env.API_BASE_URL is used.
```

### 3. Impact Analysis

Use before changing shared code.

Example:

```text
What will break if I change env.PORT logic?
```

This is useful for files like:

- `packages/shared/src/constant/env.constants.ts`
- `packages/shared/src/utils/iprep-path.ts`
- `packages/db/src/prisma.ts`
- `apps/cli/src/services/server-manager.ts`

Good prompts:

```text
Use GitNexus to check impact before changing env.DATABASE_URL.
```

```text
Use GitNexus to see what depends on IprepPaths.
```

```text
Use GitNexus to analyze what will break if I rename runOnBoard.
```

### 4. Refactoring

Use when renaming, extracting, splitting, or moving code.

Good prompts:

```text
Use GitNexus to rename checkAlreadyOnboarded to shouldContinueOnboarding.
```

```text
Use GitNexus before extracting DB migration logic.
```

```text
Use GitNexus to find all callers before moving status logic.
```

### 5. Review Current Changes

Use when you have edited files and want to understand risk.

Good prompts:

```text
Use GitNexus to analyze my current changes.
```

```text
Use GitNexus to check what flows are affected by my edits.
```

```text
Use GitNexus to review this change before commit.
```

## Common Workflow

Use this flow when working on code:

```text
1. Ask a question or describe the bug.
2. Use GitNexus to find related flows and symbols.
3. Inspect the actual files.
4. Make the code change.
5. Run typecheck/build/tests.
6. Re-run GitNexus analyze after large changes.
```

Example:

```text
Use GitNexus to debug why status command shows database not ready.
```

Then the investigation may look at:

```text
status.handler.ts
server-manager.ts
health.query.ts
prisma.ts
env.constants.ts
```

## Best Prompts To Ask Codex

Architecture:

```text
Use GitNexus and explain the architecture of this repo.
```

Feature flow:

```text
Use GitNexus to explain how iprep start works end to end.
```

Debugging:

```text
Use GitNexus to trace why this function returns false.
```

Dependencies:

```text
Use GitNexus to find everything that depends on checkDbHealth.
```

Refactor safety:

```text
Use GitNexus to check if it is safe to rename this function.
```

Current changes:

```text
Use GitNexus to analyze my unstaged changes.
```

## For This Project

The most useful GitNexus areas for iPrep are:

- CLI command flow: `apps/cli/src/commands`
- CLI handlers: `apps/cli/src/handlers`
- Server startup and health check: `apps/server/src`
- Shared env/path config: `packages/shared/src`
- Prisma and database health: `packages/db/src`

Use GitNexus especially before changing shared files, because those files are imported by multiple packages.
