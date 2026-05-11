# iPrep — Interview Preparation Platform

## What is iPrep?

iPrep is an open-source, self-hosted interview preparation platform that runs entirely on your local machine. It ships as a single npm package — users install it once and get a full-stack tool: a CLI, a local Express server, and a React frontend, all working together.

## Purpose

Help developers prepare for technical interviews by providing an interactive, AI-assisted platform that runs locally with no cloud dependency. Everything — data, sessions, exports — stays on the user's machine.

## How It Works

```
npx iprep onboard --yes
        │
        ├── sets up ~/.iprep/ directory structure
        ├── writes .env with port + DB config
        ├── runs DB migrations (SQLite)
        ├── starts local Express server
        └── opens browser → localhost frontend
```

The frontend connects to the local server. The server handles API calls, runs CLI sub-commands, and reads/writes to a local SQLite database via Prisma.

## Publishing Strategy

Only ONE package is published to npm: **`iprep`** (the CLI).

The server, shared utilities, and DB layer are bundled inside it via `tsup`. Users never install them separately.

| Package | npm published? | Role |
|---|---|---|
| `iprep` | **Yes** — the only public package | CLI entry point, orchestrates everything |
| `@iprep/server` | No — bundled inside `iprep` | Local Express server, serves frontend + API |
| `@iprep/shared` | No — bundled inside `iprep` | Env loading, constants, path utils, formatters |
| `@iprep/db` | No — bundled inside `iprep` | Prisma + SQLite queries |
| `@iprep/frontend` | No — static files shipped inside `iprep` | Vite React UI, served by the server |

## Package Details

### `iprep` (apps/cli) — v1.2.0
The published CLI package. Entry point for all user interaction.
- Built with `tsup` (bundles server + shared + db)
- Commander.js for command parsing
- `bin: { iprep: dist/index.js }` — runs as `npx iprep`
- Commands: `onboard`, `start`, `status`

### `@iprep/server` (apps/server) — v1.2.0
Local Express 5 REST API. Not published standalone.
- Serves built Vite frontend as static files
- Handles frontend API calls → delegates to `@iprep/db`
- Executes CLI sub-commands on behalf of the frontend
- Health route: `GET /api/v1/health`

### `@iprep/shared` (packages/shared) — v1.2.0
Zero-dependency utility barrel. Not published standalone.
- Env loading with Zod validation (`EnvSchema`)
- Path utilities (`IprepPaths`)
- Formatters: `randomId`, `slugify`, `truncate`, `formatDate`

### `@iprep/db` (packages/db) — v1.2.0
Prisma 7 + SQLite data layer. Not published standalone.
- Single source of DB access for server and CLI
- `better-sqlite3` adapter for synchronous SQLite in dev
- Typed query functions per model (never raw Prisma in apps)

## Roadmap

- [x] Monorepo foundation (shared, db, server, cli)
- [x] `onboard` command — full 7-step setup flow
- [ ] `start` command — launch server + open browser
- [ ] `status` command — health, env, DB connectivity check
- [ ] Switch CLI build to `tsup` (bundle server + shared + db)
- [ ] Frontend scaffold (Vite + React)
- [ ] Publish `iprep` v1.2.0 to npm
- [ ] AI-assisted interview features (LLM adapters)
