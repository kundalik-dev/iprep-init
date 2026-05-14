#!/usr/bin/env node
import { createRequire } from 'module';
import { Command } from 'commander';
import { registerCommands } from './commands/index.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program.name('iprep').description('iPrep CLI').version(pkg.version);

registerCommands(program);

program.parse(process.argv);
