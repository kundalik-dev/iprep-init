# iPrep — @iprep/cli

## Project

Commander.js CLI for iPrep — provides interactive onboarding, project directory scaffolding, and server management commands. Entry point is `src/index.ts`.

## Stack

- TypeScript 6, NodeNext ESM
- Commander.js (command parsing), chalk (terminal color), inquirer (interactive prompts)
- figlet + gradient-string (ASCII banner rendering)
- `@iprep/shared` (ENV_VARS, IprepPaths, formatters)
- `@iprep/db` (database queries, `checkDbHealth`)
- `tsx` for dev (watch mode), `tsc` for builds

## Structure

```
src/
  index.ts                      — Entry point: registers all commands on the root program
  commands/
    index.ts                    — registerCommands(program) — wires all commands; no logic here
    onboard.command.ts          — `iprep onboard` — parses flags, delegates to handlers/onboard.handler.ts
    status.command.ts           — `iprep status` — checks server health / env status
  handlers/
    onboard.handler.ts          — runOnBoard(opts) — full onboard orchestration (7 steps)
  services/
    index.ts                    — Re-exports all services
    server-manager.ts           — isPortInUse, startServer, checkHealth helpers
  config/
    env.ts                      — Frozen re-export of ENV_VARS from @iprep/shared
  utils/
    index.ts                    — Re-exports all utilities
    chalk-helper.ts             — log.{success,error,info,warn,bold,dim,highlight} + printBanner()
    fs.utils.ts                 — dirExists(path) helper

dist/                           — Compiled output (generated, do not edit)
```

## Dev Commands

```bash
pnpm dev          # tsx watch src/index.ts
pnpm build        # tsc
pnpm start        # node dist/index.js (after build)
pnpm typecheck    # tsc --noEmit
```

## Current Focus

CLI foundation is complete. `onboard` command is fully implemented. Next priorities:

1. **`status` command** — `iprep status` shows server health, env vars, and DB connectivity
2. **`start` command** — `iprep start` launches the Express server (referenced in onboard completion summary)
3. **Additional commands** — any further commands follow the command → handler pattern already established

### `onboard` command — what it does

`iprep onboard [-y]` runs a 7-step flow:

1. Checks if `~/.iprep/` already exists; prompts to re-run if so (skipped with `-y`)
2. Prompts for server port (default `5545`), validates it's free; shows summary before confirming
3. Creates `~/.iprep/{database,logs,sessions,exports}/`
4. Writes `.env` at the monorepo root with `PORT`, `NODE_ENV`, `DATABASE_URL`, `CORS_ORIGIN`, `API_BASE_URL`
5. Runs `pnpm --filter=@iprep/db db:migrate` via `execSync`
6. Verifies setup: config dir, database dir, DB file, DB health
7. Prints completion summary with next-step hint (`iprep start`)

## Command Conventions

- Each command file under `src/commands/` exports a single `register(program: Command): void` function
- `src/commands/index.ts` exports `registerCommands(program)` which calls every `register` — wiring only, no logic
- Business logic lives in `src/handlers/` — commands delegate to handlers, never contain logic themselves
- Use `log.*` from `chalk-helper.ts` for all terminal output — no raw chalk or ANSI codes inline
- Use `printBanner()` from `chalk-helper.ts` at the start of interactive flows
- Use `inquirer` for any interactive user input — never `readline` directly
- Services in `src/services/` are plain async functions — no classes, no singletons

## Don'ts

- Don't call `dotenv.config()` in the CLI — env is loaded by `@iprep/shared` on import
- Don't import `@prisma/client` directly — use `@iprep/db` query functions
- Don't put prompt logic inside `src/index.ts` — it only registers commands
- Don't use `ts-node` — use `tsx`
- Don't use `any` — use `unknown` and narrow
