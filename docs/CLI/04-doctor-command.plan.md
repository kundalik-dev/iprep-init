---
name: Doctor Command Plan
description: Detailed design plan for the iprep doctor command — comprehensive system and environment readiness checks, outputs, and handler architecture (runDoctor).
---

# iPrep CLI — `doctor` Command Plan

Entry point: `runDoctor(opts)` in `src/handlers/doctor.handler.ts`
Called from: `src/commands/doctor.command.ts`

---

## Flow Overview

```
runDoctor(opts)
  ├── printBanner()
  ├── checkEnvironment()        — Node.js version, package manager
  ├── checkLocalFiles()         — ~/.iprep/ folders, .env existence
  ├── checkDatabase()           — SQLite DB file, schema health
  ├── checkServer()             — Server /health endpoint reachable
  ├── checkConfiguration()      — Provider keys and config.json
  ├── checkCLIs()               — System dependencies (e.g., git, sqlite3)
  └── renderReport(results)     — Print chalk-styled checklist or JSON output
```

---

## Functions

### `checkEnvironment(): Promise<CheckResult[]>`

- Check Node.js version (`process.version`) is >= 20
- Check if `pnpm` (or `npm`) is installed and accessible in PATH (using `node:child_process` `exec` or `spawnSync`)
- Return status and versions

### `checkLocalFiles(): Promise<CheckResult[]>`

- Verify `IprepPaths.root` exists
- Verify required subdirectories exist (logs, sessions, exports, etc.)
- Verify `IprepPaths.isEnvExists` is true
- Provide actionable hint if missing: `Run: iprep onboard`

### `checkDatabase(): Promise<CheckResult[]>`

- Verify `fs.existsSync(IprepPaths.dbFile)`
- Call `checkDbHealth()` from `@iprep/db`
- Check if native `better-sqlite3` bindings are operational
- Provide actionable hint if failing: `Run: pnpm rebuild better-sqlite3` or `iprep onboard`

### `checkServer(): Promise<CheckResult[]>`

- Call `checkHealth()` from `server-manager` to hit `http://localhost:<port>/health`
- Provide actionable hint if missing: `Run: iprep start`

### `checkConfiguration(): Promise<CheckResult[]>`

- Verify `keys.json` and `config.json` exist in `IprepPaths.root` (if applicable)
- Verify necessary `ENV_VARS` like `PORT`, `CORS_ORIGIN`, and `API_BASE_URL` are not empty
- Provide actionable hint if failing: `Run: iprep setup`

### `checkCLIs(): Promise<CheckResult[]>`

- Check for optional but recommended global tools used by adapters (e.g., specific AI CLIs if required by plugins)
- Mark these as warnings instead of critical failures

### `renderReport(results: CheckResult[], isJson: boolean): void`

- If `isJson` is true (`--json` flag):
  - Output raw `JSON.stringify(results, null, 2)` for programmatic consumption
- If `isJson` is false:
  - Print a grouped, styled checklist using `chalk` and `log.*` from `chalk-helper.ts`
  - Groups: Environment, File System, Database, Server, Config
  - Format:
    - Pass: `  ✓ Node.js (v20.x.x)`
    - Warn: `  ! Missing config.json (Run: iprep setup)`
    - Fail: `  ✗ Database unreachable (Run: iprep onboard)`
  - Print a final summary: "All checks passed!" or "Found X issues requiring attention."

---

## Important Considerations

### Non-Destructive

- `iprep doctor` is strictly a read-only command. It must never mutate files, start processes, or run migrations.

### Programmatic Support (`--json`)

- Like the `status` command, `doctor` must support the `--json` flag to return structured data for CI/CD or adapter script validation.

### Graceful Degradation

- If the server is offline, the Server check fails but the command must continue checking keys and environment.
- Use `try/catch` aggressively inside each check function so one failing check doesn't throw an unhandled promise rejection and abort the doctor process.

### Actionable Hints

- Every failure or warning must include a clear, specific "Next Step" (e.g., what CLI command to run or what file to edit) to guide the user to resolution.

### Output Formatting

- Use `spinner.ts` while executing checks that might take time (e.g., network calls to the server or database).
- Use `printSeparator` and `log.bold` from `chalk-helper.ts` to neatly divide the report into readable sections.
