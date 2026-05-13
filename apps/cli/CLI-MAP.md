# CLI-MAP — @iprep/cli

Quick reference for every file, export, and data flow in `apps/cli/src/`.
Read this first. Open source files only when you need to edit.

---

## Commands

| Command         | Flag        | What it does                                                                   |
| --------------- | ----------- | ------------------------------------------------------------------------------ |
| `iprep onboard` | `-y, --yes` | First-time setup: creates `~/.iprep/`, writes `.env`, runs DB migration        |
| `iprep start`   | —           | Spawns the Express server subprocess, waits for health, attaches shutdown hook |
| `iprep status`  | —           | Checks server health, env vars, and DB connectivity                            |

---

## File Tree

```
src/
  index.ts                   Entry point — creates program, calls registerCommands, parses args
  commands/
    index.ts                 registerCommands(program) — wires all command files; no logic
    onboard.command.ts       Registers `iprep onboard`; delegates to runOnBoard()
    start.command.ts         Registers `iprep start`; delegates to runStart()
    status.command.ts        Registers `iprep status`; inline logic (no separate handler yet)
  handlers/
    onboard.handler.ts       runOnBoard() — 7-step onboard orchestration
    start.handler.ts         runStart() — 7-step server startup orchestration
  services/
    index.ts                 Barrel: re-exports all of server-manager.ts
    server-manager.ts        isPortInUse, startServer, checkHealth, checkDbHealth
  config/
    env.ts                   Frozen re-export of ENV_VARS from @iprep/shared
  utils/
    index.ts                 Barrel: re-exports chalk-helper + fs.utils
    chalk-helper.ts          log.*, printBanner, printSeparator, printCommandBadge, printMeta, printStep
    fs.utils.ts              dirExists(path)
```

---

## Export Index

### `src/commands/index.ts`

| Export             | Signature                    | Purpose                                         |
| ------------------ | ---------------------------- | ----------------------------------------------- |
| `registerCommands` | `(program: Command) => void` | Calls every command's `register()`; wiring only |

### `src/commands/*.command.ts`

Each command file has one export:

| Export     | Signature                    | Purpose                                       |
| ---------- | ---------------------------- | --------------------------------------------- |
| `register` | `(program: Command) => void` | Attaches one command to the Commander program |

### `src/handlers/onboard.handler.ts`

| Export       | Signature                                    | Purpose                                    |
| ------------ | -------------------------------------------- | ------------------------------------------ |
| `runOnBoard` | `(opts: { yes?: boolean }) => Promise<void>` | Full 7-step onboard flow (see steps below) |

**Onboard steps:** check if `~/.iprep/` exists → prompt port + confirm → create dirs → write `.env` → run DB migration → verify setup → print summary.

### `src/handlers/start.handler.ts`

| Export     | Signature                                           | Purpose                                      |
| ---------- | --------------------------------------------------- | -------------------------------------------- |
| `runStart` | `(_opts: Record<string, unknown>) => Promise<void>` | Full 7-step server startup (see steps below) |

**Start steps:** verify prerequisites → read port from env → check port free → spawn server subprocess → poll `/health` until ready → show running banner → attach `SIGINT`/`SIGTERM` shutdown hook.

### `src/services/server-manager.ts`

| Export          | Signature                            | Purpose                                                                             |
| --------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| `isPortInUse`   | `(port: number) => Promise<boolean>` | TCP bind probe — `true` if port is taken (`EADDRINUSE`)                             |
| `startServer`   | `(port: number) => ChildProcess`     | Spawns `server.js` via `node`; prefers bundled path, falls back to monorepo `dist/` |
| `checkHealth`   | `() => Promise<boolean>`             | `GET {API_BASE_URL}/health` with 3 s timeout; returns `true` if `res.ok`            |
| `checkDbHealth` | `() => Promise<boolean>`             | Re-exported from `@iprep/db`; runs a live DB probe                                  |

### `src/config/env.ts`

| Export | Type                 | Purpose                                                                     |
| ------ | -------------------- | --------------------------------------------------------------------------- |
| `env`  | `Readonly<ENV_VARS>` | Frozen `ENV_VARS` from `@iprep/shared`; safe to destructure anywhere in CLI |
| `Env`  | `type`               | TypeScript type of `env`                                                    |

### `src/utils/chalk-helper.ts`

| Export              | Signature                                 | Output style                                     |
| ------------------- | ----------------------------------------- | ------------------------------------------------ | --- |
| `log.success`       | `(msg: string) => string`                 | `✓  msg` in green                                |
| `log.error`         | `(msg: string) => string`                 | `✗  msg` in red                                  |
| `log.info`          | `(msg: string) => string`                 | `ℹ  msg` in cyan                                 |
| `log.warn`          | `(msg: string) => string`                 | `⚠  msg` in yellow                               |
| `log.title`         | `(msg: string) => string`                 | Bold white, newlines around                      |
| `log.dim`           | `(msg: string) => string`                 | Dimmed                                           |
| `log.bold`          | `(msg: string) => string`                 | Bold white                                       |
| `log.highlight`     | `(msg: string) => string`                 | Indigo→purple gradient                           |
| `printBanner`       | `() => void`                              | "iPrep" figlet ASCII art with gradient + tagline |
| `printSeparator`    | `() => void`                              | Gradient `─` line (52 chars)                     |
| `printCommandBadge` | `(command: string) => void`               | Dark-bg badge showing command name               |
| `printMeta`         | `(parts: string[]) => void`               | Dim metadata row, parts joined by `              | `   |
| `printStep`         | `(title: string, value?: string) => void` | `o  Title` with optional dim sub-line            |

> `log.*` methods return formatted strings — the caller is responsible for `console.log()`.

### `src/utils/fs.utils.ts`

| Export      | Signature                      | Purpose                                  |
| ----------- | ------------------------------ | ---------------------------------------- |
| `dirExists` | `(dirPath: string) => boolean` | `true` if path exists and is a directory |

---

## Command → Handler → Service Flow

```
iprep onboard
  └─ onboard.command.ts   register()
       └─ onboard.handler.ts   runOnBoard(opts)
            ├─ isPortInUse()        (services/server-manager)
            └─ checkDbHealth()      (services/server-manager → @iprep/db)

iprep start
  └─ start.command.ts     register()
       └─ start.handler.ts     runStart(opts)
            ├─ isPortInUse()        (services/server-manager)
            ├─ startServer()        (services/server-manager)
            └─ checkHealth()        (services/server-manager)

iprep status
  └─ status.command.ts    register()   ← logic lives here directly (no handler yet)
```

---

## Key Invariants

- `log.*` returns a string — wrap with `console.log(log.success(...))`, never call alone
- Commands never contain business logic — always delegate to a handler
- Handlers orchestrate; services do one thing
- Services are stateless plain async functions — no classes, no singletons
- `env` from `config/env.ts` is frozen — never mutate, never call `dotenv.config()` in CLI
- `startServer()` resolves the server entry path at call time (bundled vs dev monorepo path)
