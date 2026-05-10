import net from 'node:net';
import { checkDbHealth } from '@iprep/db';
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

async function startServer(_port: number): Promise<void> {
  // TODO: spawn the server process and wait for it to be ready
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
