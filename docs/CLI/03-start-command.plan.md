# iPrep CLI — `start` Command Plan

Entry point: `runStart(opts)` in `src/handlers/start.handler.ts`
Called from: `src/commands/start.command.ts`

---

## Flow Overview

```
runStart(opts)
  ├── checkOnboardedFirst()     — verify ~/.iprep/ and .env exist; exit if not
  ├── readPort()                — read PORT from env (ENV_VARS loaded by @iprep/shared)
  ├── guardPortFree(port)       — isPortInUse() → exit with error if port is occupied
  ├── spawnServer(port)         — spawn `pnpm --filter=@iprep/server start`; return ChildProcess
  ├── waitForReady()            — poll checkHealth() every 500ms until UP or 15s timeout
  ├── showRunningBanner(port)   — print server URL, API URL, Ctrl+C hint
  └── attachShutdownHook(child) — SIGINT → kill child → exit 0
```

---

## Functions

### `checkOnboardedFirst(): void`

- Check `fs.existsSync(IprepPaths.root)` — config dir must exist
- Check `IprepPaths.isEnvExists` — `.env` must be written
- If either is missing → print error, tell user to run `iprep onboard`, exit

### `readPort(): number`

- Return `env.PORT` from `src/config/env.ts` (already loaded from `.env` at CLI startup)
- No prompt, no file read — the value is in memory from import

### `guardPortFree(port: number): Promise<void>`

- Call `isPortInUse(port)` from `server-manager`
- If in use → print error with two hints:
  - Server may already be running → `iprep status`
  - If not, another process owns the port → change `PORT` in `.env`
- `process.exit(1)`

### `spawnServer(port: number): ChildProcess`

- Call `startServer(port)` from `server-manager` (spawns the OS process)
- Pipe `child.stdout` and `child.stderr` to `process.stdout` / `process.stderr`
- Register `child.on('error', ...)` — if spawn fails (pnpm not found, not built), print error and exit
- Register `child.on('exit', code => ...)` — if server dies unexpectedly, print error and exit
- Return the `ChildProcess` handle

### `waitForReady(): Promise<void>`

- Poll `checkHealth()` every 500ms, up to 30 attempts (15s total)
- Before the loop: write `log.info('Waiting for server')` — no newline
- Each failed attempt: write a dim `.` to stdout (no newline) — progress indicator
- On success → newline + `log.success('Server is up')`
- On timeout → newline + throw error with message to check logs above

### `showRunningBanner(port: number): void`

- Print styled block:
  - `chalk.bold.green('✓  iPrep server is running')`
  - `Server` label → `http://localhost:{port}`
  - `API` label → `http://localhost:{port}/api/v1`
  - `Press Ctrl+C to stop`

### `attachShutdownHook(child: ChildProcess): void`

- Register `process.on('SIGINT', ...)` handler
- On trigger → `log.warn('Shutting down...')` → `child.kill('SIGTERM')` → `process.exit(0)`

---

## Service changes — `server-manager.ts`

### `startServer(port: number): ChildProcess`

- Use `spawn` from `node:child_process`
- Command: `node apps/server/dist/index.js` — invokes node directly, no package manager needed
- `cwd`: monorepo root — derived from `path.dirname(IprepPaths.envFilePath)`
- `stdio`: `['ignore', 'pipe', 'pipe']` — caller pipes stdout/stderr themselves
- Pass `PORT` in env: `{ ...process.env, PORT: String(port) }`
- Return the `ChildProcess` directly (no async, spawn returns immediately)
- Requires the server to be pre-built (`tsc`) — `iprep start` is a production command, not dev

---

## Important Considerations

### Guard: onboard must run first

- `iprep start` has no meaning without `~/.iprep/` and `.env`
- Check both before spawning
- Error message must name the fix: `run iprep onboard first`

### Port already in use

- Two possible causes: server already running, or an unrelated process
- Always suggest `iprep status` first (cheapest check), then manual port change
- Never kill the foreign process — exit and let the user decide

### Server startup timing

- Express takes a moment to bind — do not assume ready right after spawn
- Poll `/health` endpoint instead of a fixed sleep
- Timeout after 15s with a clear message and instructions

### Graceful shutdown

- The spawned child is a separate OS process — it outlives the CLI if not killed
- Always register SIGINT before the process idles (right after `showRunningBanner`)
- Use `SIGTERM` not `SIGKILL` so Express can finish in-flight requests

### stdout streaming

- Pipe child stdout/stderr immediately after spawn, before `waitForReady`
- Server boot logs appear in the terminal during the health-check loop

### Cross-platform spawn

- `node` is a real binary on all platforms — no `shell: true` needed
- Avoids any package manager dependency at runtime (works with npm, pnpm, yarn, bun)

### No dotenv in CLI

- Per CLAUDE.md: do not call `dotenv.config()` in CLI code
- `ENV_VARS` (and therefore `env.PORT`) is loaded by `@iprep/shared` at import time
