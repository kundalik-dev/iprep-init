/**
 * IprepPaths — canonical path resolver for the ~/.iprep/ home directory.
 *
 * Imported by both the CLI and the server so every package resolves
 * user data from the same location: os.homedir() + '/.iprep'.
 *
 * On Windows : C:\Users\<name>\.iprep\
 * On macOS   : /Users/<name>/.iprep/
 * On Linux   : /home/<name>/.iprep/
 */

import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

export const IPREP_HOME = path.join(os.homedir(), '.iprep');

const dirName = path.dirname(fileURLToPath(import.meta.url));
const envExists = fs.existsSync(path.resolve(dirName, '../../../../.env'));

export const IprepPaths = {
  // The directory where iprep stores all user data, including configs, logs, and cache.

  /** Root: ~/.iprep/ */
  root: IPREP_HOME,

  // checks CWD directory
  cwd: dirName,

  //checks if .env file exists
  isEnvExists: envExists,

  // .env file path
  envFilePath: path.resolve(dirName, '../../../../.env'),

  /** SQLite database folder: ~/.iprep/database/ */
  database: path.join(IPREP_HOME, 'database'),

  /** SQLite file: ~/.iprep/database/iprep.db */
  dbFile: path.join(IPREP_HOME, 'database', 'iprep.db'),
};
