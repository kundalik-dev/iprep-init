# iPrep — @iprep/db

## Project

Database access layer — wraps Prisma 7 with a better-sqlite3 adapter and exposes typed query functions. The only package that touches `@prisma/client` directly; all other packages and apps go through this package.

## Stack

- TypeScript 6, NodeNext ESM
- Prisma 7 + `@prisma/adapter-better-sqlite3`
- SQLite (dev); Prisma schema can be migrated to Postgres for production
- `@iprep/shared` (env vars for DATABASE_URL)
- `tsc` for builds

## Structure

```
src/
  index.ts                      — Public barrel (exports prisma client + queries)
  prisma.ts                     — PrismaClient singleton with better-sqlite3 adapter
  migrate.ts                    — Programmatic migration runner
  queries/
    user.query.ts               — Typed user CRUD query functions
  generated/
    prisma/                     — Auto-generated Prisma types (do not edit)

prisma/
  schema.prisma                 — Source of truth for DB schema
  migrations/                   — Migration history (committed to git)

dist/                           — Compiled output (generated, do not edit)
```

## Dev Commands

```bash
pnpm build          # compile with tsc → dist/
pnpm db:generate    # regenerate Prisma client after schema.prisma changes
pnpm db:migrate     # run prisma migrate dev (creates migration + applies it)
```

## Conventions

- Run `pnpm db:generate` immediately after any change to `schema.prisma`
- All DB access in apps goes through query functions exported from this package — never raw Prisma calls in apps
- Migration names must be descriptive: `add_user_roles` not `migration1`
- `DATABASE_URL` is read from `@iprep/shared` `ENV_VARS` — never hardcode connection strings
- Prisma client is a singleton in `prisma.ts` — never instantiate `PrismaClient` more than once

## Don'ts

- Don't import `@prisma/client` anywhere outside this package
- Don't put business logic in query files — queries return data, apps decide what to do with it
- Don't commit the `dev.db` SQLite file — it is gitignored
- Don't run `prisma migrate deploy` in development — use `prisma migrate dev`

## Current Focus

Initial schema with a `User` model in place. `user.query.ts` contains typed CRUD functions.
Prisma client uses the `better-sqlite3` adapter for synchronous SQLite access in dev.
