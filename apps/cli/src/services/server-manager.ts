import net from 'node:net';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn, type ChildProcess } from 'node:child_process';
import { checkDbHealth } from '@iprep/db';
import { IprepPaths } from '@iprep/shared';
import { env } from '../config/env.js';

// Probes a port by attempting to bind a TCP server on it.
// If binding succeeds → port is free (close immediately, return false).
// If binding fails with EADDRINUSE → something owns that port (return true).
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    // Port already taken — resolve true only for EADDRINUSE, false for anything else
    server.once('error', (err: NodeJS.ErrnoException) => {
      resolve(err.code === 'EADDRINUSE');
    });

    // Port was free — release it immediately and report not in use
    server.once('listening', () => {
      server.close(() => resolve(false));
    });

    server.listen(port, '127.0.0.1');
  });
}

// Start server
function startServer(port: number): ChildProcess {
  // Production (bundled): server.js lives next to index.js in dist/
  // Dev (tsx): fall back to the monorepo server build
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const bundledPath = path.join(__dirname, 'server.js');
  const monorepoRoot = path.dirname(IprepPaths.envFilePath);
  const devPath = path.join(monorepoRoot, 'apps', 'server', 'dist', 'server.js');
  const serverEntry = existsSync(bundledPath) ? bundledPath : devPath;

  return spawn('node', [serverEntry], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port) },
  });
}

// Checks server is running and healthy
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${env.API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export { isPortInUse, startServer, checkDbHealth };
