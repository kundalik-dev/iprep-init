# iPrep - @iprep/frontend

## Project

Vite React frontend for iPrep - the browser UI for onboarding, dashboard, interview setup, live sessions, history, AI Coach, notes/files, communication insights, and settings.

The UI is planned to be hosted on Vercel and connect to the user's local iPrep server at `http://localhost:5545/api/v1`.

## Stack

- React 19, TypeScript 6, Vite 8
- Tailwind CSS 4 via `@tailwindcss/vite`
- shadcn-style local components backed by Radix primitives
- lucide-react for icons
- `class-variance-authority`, `clsx`, and `tailwind-merge` for component variants/classes
- API contract follows `docs/brain-storming/api-requirements.md`

## Structure

```
src/
  main.tsx                      - React entry point
  App.tsx                       - Current boilerplate app shell and dashboard placeholder
  index.css                     - Tailwind import, iPrep design tokens, shell/layout styles
  components/
    ui/                         - shadcn-style reusable UI primitives
      badge.tsx
      button.tsx
      card.tsx
  lib/
    api.ts                      - Frontend API base URL config
    provider-models.ts          - Configurable onboarding provider/model defaults
    utils.ts                    - cn() helper for clsx + tailwind-merge

public/
  favicon.svg                   - iPrep favicon

components.json                 - shadcn configuration
dist/                           - Production build output (generated, do not edit)
```

## Dev Commands

```bash
pnpm dev          # start Vite dev server
pnpm build        # tsc -b + vite production build
pnpm lint         # eslint .
pnpm typecheck    # tsc -b --pretty false
pnpm preview      # preview production build
```

From the monorepo root:

```bash
pnpm --filter @iprep/frontend dev
pnpm --filter @iprep/frontend build
pnpm --filter @iprep/frontend lint
```

## API Conventions

- Use `/api/v1` endpoints from `docs/brain-storming/api-requirements.md`, not the older demo-app `/api` contract.
- Default API base URL is `http://localhost:5545/api/v1`.
- Override the API base URL with `VITE_API_BASE_URL` for Vercel previews or local testing.
- Keep API calls in focused client modules under `src/lib/` or future `src/features/*/api.ts` files.
- Do not hardcode endpoint strings inside visual components once real data wiring begins.

## UI Conventions

- Use the Claude HTML prototype in `docs/demo-app/claude-iprep-html/` as the visual reference.
- Preserve the iPrep shell direction: dark sidebar, compact dashboard, card-based work surfaces, restrained gradients, and dense operational layouts.
- Use shadcn-style primitives as local source code, then compose domain components on top.
- Prefer lucide icons for navigation, buttons, settings, and tool actions.
- Keep reusable UI primitives in `src/components/ui/`.
- Put product/domain components in future feature folders, for example `src/features/dashboard/`, `src/features/interviews/`, and `src/features/settings/`.
- Use `@/*` imports for source files.

## Don'ts

- Don't use the old `docs/demo-app/app-docs/03-api-requirements.md` endpoint shape for the real frontend.
- Don't deep-import from server or DB packages; the frontend talks to the local server over HTTP.
- Don't import secrets or server-only env values into the frontend.
- Don't keep Vite starter assets or sample UI in product screens.
- Don't edit generated `dist/` output.
- Don't make large visual rewrites that drift away from the Claude prototype without an explicit design decision.

## Current Focus

Frontend foundation is in place: Vite React TypeScript app, Tailwind 4, shadcn-compatible config, local UI primitives, `@/*` alias, and an iPrep boilerplate shell styled after `docs/demo-app/claude-iprep-html`.

Next: split the boilerplate into route/feature components, add a client for `/api/v1/bootstrap`, and replace placeholder data with local server responses.
