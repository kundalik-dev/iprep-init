# @iprep/server

> Local Express 5 API server for iPrep. Bundled inside the `iprep` CLI package — not published to npm as a standalone package.

## Overview

This package is the backend for the iPrep platform. It is spawned as a child process by the `iprep` CLI and is not intended to be run directly by end users. If you want to use iPrep, see the [`iprep`](../cli/README.md) CLI package.

## Architecture

```
iprep (CLI)
  └── spawns dist/server.js as a child process
        └── serves built Vite frontend as static files
        └── handles API requests from the frontend
        └── reads/writes to ~/.iprep/database/ via @iprep/db
```

## Development

```bash
# From the monorepo root
pnpm --filter=@iprep/server dev     # tsx watch mode
pnpm --filter=@iprep/server build   # compile to dist/

# Or from this directory
pnpm dev
pnpm build
```

## API Routes

All routes are mounted under `/api/v1`.

| Method | Path             | Description         |
| ------ | ---------------- | ------------------- |
| `GET`  | `/api/v1/health` | Server health check |

## Environment Variables

The server reads its config from `.env` at the monorepo root (or `~/.iprep/.env` when installed via CLI). Variables are loaded and validated by `@iprep/shared`.

| Variable       | Default                        | Description                            |
| -------------- | ------------------------------ | -------------------------------------- |
| `PORT`         | `5545`                         | Port the server listens on             |
| `NODE_ENV`     | `development`                  | Node environment                       |
| `DATABASE_URL` | `~/.iprep/database/iprep.db`   | SQLite database path                   |
| `CORS_ORIGIN`  | `http://localhost:5173`        | Allowed CORS origin (frontend)         |
| `API_BASE_URL` | `http://localhost:5545/api/v1` | Base URL used by the CLI health checks |

## Stack

- Express 5
- TypeScript 6, NodeNext ESM
- `@iprep/shared` — env loading and utilities
- `@iprep/db` — Prisma 7 + SQLite data access

## Package Status

This package is **internal** — it is bundled into the `iprep` CLI via `tsup` at publish time. The `workspace:*` dependency in the CLI's `devDependencies` is resolved locally during development and inlined into the bundle during the production build.
