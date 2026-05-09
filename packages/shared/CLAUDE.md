# iPrep — @iprep/shared

## Project

Shared barrel package — exports constants, Zod schemas, path utilities, and formatter helpers consumed by all other packages and apps. Has zero internal package dependencies.

## Stack

- TypeScript 6, NodeNext ESM
- Zod 4 (env schema validation)
- dotenv (env file loading)
- `tsc` for builds, `tsc --watch` for dev

## Structure

```
src/
  index.ts                      — Public barrel (re-exports schemas, constant, utils)
  schemas/
    env.schema.ts               — EnvSchema (Zod, no defaults) + EnvVars type
    index.ts                    — Barrel: re-exports env.schema.js
  constant/
    env.constants.ts            — loadEnv(), DEFAULTS, ENV_VARS, APP_NAME, APP_VERSION
    index.ts                    — Barrel: re-exports env.constants.js
  utils/
    iprep-path.ts               — IprepPaths object: envFilePath, isEnvExists, dbFile, cwd
    formatters.ts               — randomId, slugify, truncate, formatDate, formatTimestamp
    index.ts                    — Barrel: re-exports iprep-path.js + formatters.js

dist/                           — Compiled output (generated, do not edit)
```

## Dev Commands

```bash
pnpm build        # compile with tsc → dist/
pnpm dev          # tsc --watch
pnpm typecheck    # tsc --noEmit
```

## Conventions

- `EnvSchema` is always pure — no `.default()` calls; defaults live in `env.constants.ts` only
- `IprepPaths` is the single source for all file/directory paths — computed once at startup
- Use `fileURLToPath(import.meta.url)` for ESM-safe `__dirname` — never use CJS `__dirname`
- All exports flow through `src/index.ts` barrel — consumers import from `@iprep/shared`
- Named exports only — no default exports from any file in this package

## Don'ts

- Don't add `.default()` to `EnvSchema` fields — breaks the missing-field error detection
- Don't import from other internal packages (`@iprep/db`, etc.) — shared has zero internal deps
- Don't call `dotenv.config()` more than once — it runs inside `loadEnv()` in `env.constants.ts`
- Don't add app-specific logic here — this package must remain generic and reusable

## Current Focus

`env.constants.ts` implements three-case env loading:
1. No `.env` file → use DEFAULTS silently
2. `.env` exists + all fields valid → use parsed values
3. `.env` exists + missing/invalid fields → print `[iPrep] .env file is missing required fields:` per field and exit
`formatters.ts` exposes `randomId()` (via `crypto.randomUUID()`), `slugify`, `truncate`, `formatDate`, `formatTimestamp`.
