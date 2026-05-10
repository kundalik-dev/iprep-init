# CLI Learning — Building a CLI with Commander.js

A short reference for how `@iprep/cli` is structured and how to add commands to it.

---

## 1. What is a CLI?

A CLI (Command Line Interface) is a Node.js program that reads arguments from the terminal and runs code based on them.

```
$ iprep onboard        # runs the onboard command
$ iprep setup          # runs the setup command
$ iprep --help         # built-in help from Commander
```

---

## 2. Key Libraries

| Library     | Role                                        |
| ----------- | ------------------------------------------- |
| `commander` | Parses commands, options, and args          |
| `inquirer`  | Interactive prompts (text, select, confirm) |
| `chalk`     | Terminal colors (`chalk.green(...)`)        |

---

## 3. Entry Point — `src/index.ts`

This is where the CLI program is created and all commands are registered.

```ts
import { Command } from 'commander';
import { registerCommands } from './commands/index.js';

const program = new Command();

program.name('iprep').description('iPrep CLI').version('0.1.0');

registerCommands(program);

program.parse(process.argv);
```

**Rule:** `index.ts` only wires. No logic lives here.

---

## 4. Command File Pattern

Each command lives in its own file and exports a single `register` function.

```ts
// src/commands/onboard.command.ts
import { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('onboard')
    .description('Interactive setup for a new iPrep project')
    .action(async () => {
      // command logic here
    });
}
```

---

## 5. Wiring Commands — `src/commands/index.ts`

Imports every `register` function and calls them all.

```ts
import { Command } from 'commander';
import { register as registerOnboard } from './onboard.command.js';
import { register as registerStatus } from './status.command.js';

export function registerCommands(program: Command): void {
  registerOnboard(program);
  registerStatus(program);
}
```

**Rule:** One import + one call per command. No logic here either.

---

## 6. Onboard Command — Using Inquirer

The `onboard` command collects user input interactively, then writes a config file.

```ts
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';

export function register(program: Command): void {
  program
    .command('onboard')
    .description('Set up a new iPrep project')
    .action(async () => {
      console.log(chalk.bold('\n Welcome to iPrep\n'));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: 'my-iprep',
        },
        {
          type: 'number',
          name: 'port',
          message: 'Server port:',
          default: 3000,
        },
        {
          type: 'confirm',
          name: 'createDirs',
          message: 'Scaffold project directories?',
          default: true,
        },
      ]);

      // Write config
      const config = {
        projectName: answers.projectName,
        port: answers.port,
      };
      await fs.writeFile('.iprep.json', JSON.stringify(config, null, 2));
      console.log(chalk.green('\n .iprep.json created'));

      // Optionally scaffold dirs
      if (answers.createDirs) {
        await scaffoldDirs();
      }
    });
}

async function scaffoldDirs(): Promise<void> {
  const dirs = ['questions', 'sessions', 'exports'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
  }
  console.log(chalk.green(' Directories created: questions/, sessions/, exports/'));
}
```

---

## 7. Setup Command — Scaffolding Directories

A simpler command that just creates the directory structure without prompts.

```ts
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';

export function register(program: Command): void {
  program
    .command('setup')
    .description('Scaffold iPrep project directories')
    .option('-d, --dir <path>', 'target directory', '.')
    .action(async (opts) => {
      const base = path.resolve(opts.dir);
      const dirs = ['questions', 'sessions', 'exports'];

      for (const dir of dirs) {
        await fs.mkdir(path.join(base, dir), { recursive: true });
        console.log(chalk.green(`  created  ${dir}/`));
      }

      console.log(chalk.bold('\n Setup complete'));
    });
}
```

---

## 8. Services Pattern — `src/services/`

Services are plain async functions. No classes, no singletons.

```ts
// src/services/server-manager.ts
import net from 'node:net';

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

export async function checkHealth(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/api/v1/health`);
    return res.ok;
  } catch {
    return false;
  }
}
```

---

## 9. Run in Dev

```bash
pnpm --filter=@iprep/cli dev       # tsx watch — auto-restarts on save
```

Or run a specific command directly:

```bash
npx tsx src/index.ts onboard
npx tsx src/index.ts setup --dir ./my-project
```

---

## 10. Quick Checklist — Adding a New Command

1. Create `src/commands/<name>.command.ts` with `export function register(program: Command): void`
2. Add the import + call in `src/commands/index.ts`
3. Use `inquirer` for prompts, `chalk` for output, `node:fs` for file ops
4. Run `pnpm typecheck` to verify — no `any`, `.js` extensions on all relative imports
