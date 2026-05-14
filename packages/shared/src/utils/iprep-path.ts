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

export const IprepPaths = {
  /** Root: ~/.iprep/ */
  root: IPREP_HOME,

  /** Package source directory (dev use only) */
  cwd: dirName,

  /** ~/.iprep/.env */
  envFilePath: path.join(IPREP_HOME, '.env'),

  /** true when ~/.iprep/.env exists on disk */
  get isEnvExists(): boolean {
    return fs.existsSync(this.envFilePath);
  },

  /** SQLite database folder: ~/.iprep/database/ */
  database: path.join(IPREP_HOME, 'database'),

  /** SQLite file: ~/.iprep/database/iprep.db */
  dbFile: path.join(IPREP_HOME, 'database', 'iprep.db'),

  /** Logs folder: ~/.iprep/logs/ */
  logs: path.join(IPREP_HOME, 'logs'),

  /** CLI logs: ~/.iprep/logs/cli-log/ */
  cliLogs: path.join(IPREP_HOME, 'logs', 'cli-log'),

  /** Server logs: ~/.iprep/logs/server-log/ */
  serverLogs: path.join(IPREP_HOME, 'logs', 'server-log'),

  /** Sessions folder: ~/.iprep/sessions/ */
  sessions: path.join(IPREP_HOME, 'sessions'),

  /** Skills folder: ~/.iprep/skills/ */
  skills: path.join(IPREP_HOME, 'skills'),

  /** Docs folder: ~/.iprep/docs/ */
  docs: path.join(IPREP_HOME, 'docs'),

  /** Interview data folder: ~/.iprep/interview-data/ */
  interviewData: path.join(IPREP_HOME, 'interview-data'),

  /** Exports folder: ~/.iprep/exports/ */
  exports: path.join(IPREP_HOME, 'exports'),

  /** Backups folder: ~/.iprep/backups/ */
  backups: path.join(IPREP_HOME, 'backups'),
};
