# iPrep — @iprep/cli

## Project

Commander.js CLI for iPrep — provides interactive onboarding, project directory scaffolding, and server management commands. Entry point is `src/index.ts`.

## Stack

- TypeScript 6, NodeNext ESM
- Commander.js (command parsing), chalk (terminal color), inquirer (interactive prompts)
- `@iprep/shared` (ENV_VARS, formatters)
- `@iprep/db` (database queries, when needed)
- `tsx` for dev (watch mode), `tsc` for builds

## Structure

```
src/
  index.ts                      — Entry point: registers all commands on the root program
  commands/
    index.ts                    — Re-exports all commands; registers them in index.ts
    onboard.command.ts            — `iprep onboard` — scaffolds the project directory structure
    status.command.ts           — `iprep status` — checks server health / env status
  services/
    index.ts                    — Re-exports all services
    server-manager.ts           — isPortInUse, startServer, checkHealth helpers
  utils/
    index.ts                    — Shared CLI utilities (formatting, prompts, fs helpers)

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

Setting up the CLI foundation with three priorities:

1. **Structure** — wire up `src/index.ts` as the Commander root program; all commands register through `src/commands/index.ts`
2. **`onboard` command** — interactive `iprep onboard` flow using inquirer prompts; collects project name, port, and other config, then writes a local `.iprep.json` config file
3. **`setup` command** — `iprep setup` scaffolds the expected iPrep directory structure on disk (e.g. `/questions`, `/sessions`, `/exports`) using `node:fs`

## Command Conventions

- Each command lives in its own file under `src/commands/` and exports a single `register(program: Command): void` function
- `src/commands/index.ts` imports every `register` function and calls them all — `index.ts` only wires, never adds logic
- Use `chalk` for all terminal output color — no raw ANSI codes
- Use `inquirer` for any interactive user input — never `readline` directly
- Services in `src/services/` are plain async functions — no classes, no singletons

## Don'ts

- Don't call `dotenv.config()` in the CLI — env is loaded by `@iprep/shared` on import
- Don't import `@prisma/client` directly — use `@iprep/db` query functions
- Don't put prompt logic inside `src/index.ts` — it only registers commands
- Don't use `ts-node` — use `tsx`
- Don't use `any` — use `unknown` and narrow
