---
name: npm Publish Rules
description: Rules and checklist for publishing the iPrep CLI package to npm.
---

# npm Publish Rules

These rules apply when publishing iPrep packages to npm.

## Publish Scope

Only publish the CLI package:

```text
apps/cli
```

Do not publish these packages directly:

```text
apps/server
packages/shared
packages/db
```

Reason: the server and internal packages are bundled into the CLI build. Published users should install and run one npm package: `iprep`.

## Package Manager

Use `pnpm` for development and release preparation.

Do not use `npm install`, `yarn install`, or `bun install` in this repo because they can change lockfiles and dependency layout.

Allowed:

```bash
pnpm install
pnpm --filter=iprep build
pnpm --filter=iprep typecheck
```

## Runtime Dependency Rules

Anything needed by the published CLI at runtime must be in `apps/cli/package.json` under `dependencies`.

Examples:

```json
"dependencies": {
  "better-sqlite3": "^12.9.0",
  "@prisma/adapter-better-sqlite3": "^7.8.0",
  "@prisma/client": "^7.8.0"
}
```

Do not put runtime dependencies in `devDependencies`.

Workspace-only packages such as `@iprep/db` and `@iprep/shared` may stay in `devDependencies` only because they are bundled into the CLI by `tsup`.

## Native Dependency Rules

`better-sqlite3` requires a native build step.

The workspace must allow its build script:

```yaml
allowBuilds:
  better-sqlite3: true
```

If pnpm reports ignored build scripts, run:

```bash
pnpm approve-builds --all
```

Then verify the CLI can onboard successfully:

```bash
node apps/cli/dist/index.js onboard --yes
```

## Pre-Publish Checklist

Run these before publishing:

```bash
pnpm install
pnpm --filter=@iprep/db build
pnpm --filter=iprep typecheck
pnpm --filter=iprep build
```

Then test the built CLI:

```bash
node apps/cli/dist/index.js --help
node apps/cli/dist/index.js onboard --yes
node apps/cli/dist/index.js status
```

Expected status after onboarding and starting the server:

```text
Server      Running
Database    Ready
```

## Package Contents Check

Before publishing, inspect what npm will include:

```bash
cd apps/cli
npm pack --dry-run
```

The package should include:

```text
dist/index.js
dist/server.js
package.json
README.md
```

The package must not include:

```text
.env
.gitnexus/
.pnpm-store/
node_modules/
dev.db
*.db
coverage/
src/
```

The `apps/cli/package.json` `files` field should stay restrictive:

```json
"files": [
  "dist"
]
```

Add extra files only when users need them at runtime or for npm package documentation.

## Versioning Rules

Use semantic versioning:

| Change Type | Version Bump | Example |
| ----------- | ------------ | ------- |
| Bug fix | Patch | `1.2.1` -> `1.2.2` |
| New backward-compatible feature | Minor | `1.2.1` -> `1.3.0` |
| Breaking change | Major | `1.2.1` -> `2.0.0` |

Update the version in:

```text
apps/cli/package.json
```

Keep the root `package.json` version aligned only if the release represents the whole monorepo version.

## Publish Command

Publish from the CLI package directory:

```bash
cd apps/cli
npm publish
```

If the package ever becomes scoped, use:

```bash
npm publish --access public
```

Do not publish from the monorepo root.

## Post-Publish Verification

After publishing, verify install and execution from a clean location:

```bash
npm view iprep version
npx iprep --help
npx iprep status
```

For global install testing:

```bash
npm install -g iprep
iprep --help
iprep status
```

## Release Safety Rules

Never publish if:

- Typecheck fails.
- Build fails.
- `npm pack --dry-run` includes secrets, local DB files, caches, or source files unintentionally.
- `onboard --yes` cannot create the local config and database.
- `status` reports database setup failure after onboarding.
- The package version already exists on npm.

Do not use `--force` with npm publish. npm versions are immutable; fix the issue and publish a new version.

