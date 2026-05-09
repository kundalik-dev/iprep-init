# iPrep — @iprep/server

## Project

Express 5 REST API server for iPrep — handles HTTP routing, request validation, and delegates to `@iprep/db` for data access. Entry point is `src/server.ts`; app setup is in `src/app.ts`.

## Stack

- TypeScript 6, NodeNext ESM
- Express 5, cors, dotenv
- `@iprep/shared` (ENV_VARS, EnvSchema, formatters)
- `@iprep/db` (database queries)
- `tsx` for dev (watch mode), `tsc` for builds

## Structure

```
src/
  server.ts                     — Entry point: starts HTTP server on ENV_VARS.PORT
  app.ts                        — Express app setup: middleware, mounts apiRoutes
  config/
    env.ts                      — Imports ENV_VARS from @iprep/shared, re-exports frozen env
  routes/
    index.ts                    — apiRoutes: top-level Router, mounts all sub-routes
    health.route.ts             — GET /api/v1/health
  controller/
    health.controller.ts        — Handler for health route

dist/                           — Compiled output (generated, do not edit)
```

## Dev Commands

```bash
pnpm dev          # tsx watch src/server.ts
pnpm build        # tsc
pnpm start        # node dist/server.js (after build)
pnpm typecheck    # tsc --noEmit
```

## Conventions

- All routes are mounted under `/api/v1` via `apiRoutes` in `src/routes/index.ts`
- Route files only define the Router — business logic goes in controller files
- Always import env via `src/config/env.ts` (`env.PORT`) not directly from `@iprep/shared`
- Use `.js` extension in all relative imports (NodeNext ESM requirement)
- Export `Router` instances with explicit `: Router` type annotation to avoid portability errors

## Don'ts

- Don't call `dotenv.config()` in the server — env is loaded by `@iprep/shared` on import
- Don't import `@prisma/client` directly — use `@iprep/db` query functions
- Don't put logic in `app.ts` — it only wires middleware and routes
- Don't use `ts-node` — use `tsx`

## Current Focus

Foundation in place: server starts, health route responds at `GET /api/v1/health`.
`src/config/env.ts` validates env on startup via `@iprep/shared` and freezes the config object.
Next: adding feature routes and wiring `@iprep/db` queries into controllers.
