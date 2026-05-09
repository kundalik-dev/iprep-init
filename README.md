# my-monorepo

A full-stack monorepo with CLI, frontend, and server apps sharing common packages.

## Stack

- **Runtime**: Node.js 20+
- **Package Manager**: pnpm 9+ with workspaces
- **Build**: Turborepo
- **Language**: TypeScript 5+
- **Database**: PostgreSQL via Prisma
- **Frontend**: Next.js
- **CLI**: Commander.js

## Structure

\```
my-monorepo/
├── apps/
│ ├── cli/ # CLI tool
│ ├── frontend/ # Next.js web app
│ └── server/ # Express API server
└── packages/
├── shared/ # Shared types, utils, constants
├── db/ # Prisma client, schema, migrations
└── llm-adapters/ # LLM provider wrappers (OpenAI, Anthropic, Ollama)
\```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (or Docker)

## Getting Started

\```bash

# 1. Clone

git clone <repo-url>
cd my-monorepo

# 2. Install all dependencies

pnpm install

# 3. Setup environment

cp .env.example .env

# Edit .env with your values

# 4. Generate Prisma client

pnpm db:generate

# 5. Run migrations

pnpm db:migrate

# 6. Start everything in dev mode

pnpm dev
\```

## Common Commands

\```bash

# Dev

pnpm dev # start all apps
pnpm dev:server # server only
pnpm dev:frontend # frontend only
pnpm dev:cli # cli only

# Build

pnpm build # build all
pnpm build:packages # build internal packages only

# Database

pnpm db:generate # generate Prisma client after schema change
pnpm db:migrate # run pending migrations
pnpm db:studio # open Prisma Studio

# Code Quality

pnpm lint # lint all packages
pnpm typecheck # typecheck all packages
pnpm format # format all files with Prettier
pnpm format:check # check formatting without writing

# Test

pnpm test # run all tests
\```

## Adding a New Package

\```bash

# 1. Create folder

mkdir packages/my-package

# 2. Add package.json with name @myrepo/my-package

# 3. Reference it from any app

# In apps/server/package.json:

# "@myrepo/my-package": "workspace:\*"

# 4. Run install to link

pnpm install
\```

## Environment Variables

See `.env.example` for all required variables.

## Contributing

- All commits must pass lint and typecheck (enforced via Husky)
- Run `pnpm format` before committing
- Keep package boundaries clean — apps import from packages, never from each other
