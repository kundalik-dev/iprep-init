---
name: Onboard Command Plan
description: Detailed design plan for the iprep onboard command — 7-step setup flow, inputs, outputs, and handler architecture (runOnBoard).
---

# iPrep CLI — `onboard` Command Plan

Entry point: `runOnBoard(opts)` in `src/handlers/onboard.handler.ts`
Called from: `src/commands/onboard.command.ts`

---

## Flow Overview

```
runOnBoard(opts)
  ├── printBanner()
  ├── checkAlreadyOnboarded()
  ├── collectUserInput(opts)        ← skipped if --yes flag
  ├── createDirectoryStructure()
  ├── writeEnvFile(config)
  ├── runDbMigration()
  ├── verifySetup()
  └── showCompletionSummary()
```

---

## Functions

### `checkAlreadyOnboarded(): Promise<boolean>`

- Check if `IprepPaths.root` (~/.iprep/) already exists on disk
- If yes → prompt user: re-onboard or abort?
- If --yes flag → skip prompt, proceed and overwrite
- Returns true if safe to continue

### `collectUserInput(opts): Promise<OnboardConfig>`

- Use `inquirer` to collect:
  - **Port** — default `5545`, validate it is a number 1–65535
  - **Confirm** — show a summary and ask "Looks good?" before proceeding
- If `opts.yes` is true → skip all prompts, return defaults
- Returns a config object `{ port, ... }`

### `createDirectoryStructure()`

- Create these dirs using `fs.mkdirSync` with `{ recursive: true }`:
  - `~/.iprep/` — root (from `IprepPaths.root`)
  - `~/.iprep/database/` — SQLite file lives here (from `IprepPaths.database`)
  - `~/.iprep/logs/` — future log files
  - `~/.iprep/sessions/` — saved interview sessions
  - `~/.iprep/exports/` — exported reports
- Print each directory created with `log.success`

### `writeEnvFile(config: OnboardConfig)`

- Write `.env` at project root (use `IprepPaths.envFilePath`)
- Fields to write:
  ```
  PORT=<config.port>
  NODE_ENV=development
  DATABASE_URL=file:<IprepPaths.dbFile with forward slashes>
  CORS_ORIGIN=http://localhost:5173
  API_BASE_URL=http://localhost:<config.port>/api/v1
  ```
- If `.env` already exists → ask before overwriting (unless --yes)
- Use `fs.writeFileSync` — not append, always full overwrite

### `runDbMigration()`

- Spawn `prisma migrate deploy` as a child process using `node:child_process`
- Wait for it to finish
- On success → `log.success('Database migrated')`
- On failure → `log.error(...)` with the stderr output and suggest running manually

### `verifySetup()`

- After all steps, run quick checks:
  - `fs.existsSync(IprepPaths.root)` — dirs created
  - `fs.existsSync(IprepPaths.dbFile)` — DB file exists after migration
  - `checkDbHealth()` from `@iprep/db` — DB is actually queryable
- Print pass/fail for each check

### `showCompletionSummary()`

- Print a styled completion block showing:
  - Dirs created
  - DB location
  - Port configured
  - Next step: `iprep start` to start the server

---

## Important Considerations

### --yes flag

- Must skip every `inquirer` prompt
- Use all defaults: port=5545, overwrite existing setup without asking
- Makes onboard scriptable / CI-friendly

### Idempotency

- Running `iprep onboard` twice must not corrupt existing setup
- `mkdirSync({ recursive: true })` is safe — no error if dir exists
- `.env` overwrite must be behind a confirmation (unless --yes)
- Migration with `migrate deploy` is idempotent — skips already-applied migrations

### Port conflict

- Before writing port to .env, call `isPortInUse(port)` from `server-manager`
- If port is in use → warn the user and ask to pick another port
- Do not write a port that is already occupied

### Cross-platform paths

- Always use `IprepPaths.*` from `@iprep/shared` — never hardcode paths
- DATABASE_URL written to .env must use forward slashes (`file:C:/Users/...`)
- Use `path.join` for constructing paths, then `.replace(/\\/g, '/')` only when writing URLs

### Error handling

- Wrap each step in try/catch
- On failure of any step: print what failed, print what was already done, do NOT clean up partial state (user can re-run)
- `EACCES` on directory creation → tell the user to check permissions on their home directory

### Migration failure

- `better-sqlite3` native bindings must be compiled — if migration fails, print a clear message:
  `Run: pnpm rebuild better-sqlite3` then re-run `iprep onboard`

### No dotenv.config() in CLI

- Per CLAUDE.md: do not call `dotenv.config()` in CLI code
- Env is loaded by `@iprep/shared` on import automatically

### Output style

- Use `printBanner()` at the start
- Use `log.*` from `chalk-helper` for all output — no raw `console.log` with strings
- Use `chalk.dim` for secondary info (paths, URLs)
- Each major step should print its own status line as it completes, not all at the end

```js
node -e "new (require('D:/coding2k26/iPrep-practice/04-iPrep-setup-monorepo/node_modules/.pnpm/better-sqlite3@12.9.0/node_modules/better-sqlite3'))(':memory:'); console.log('binary OK')"
```
