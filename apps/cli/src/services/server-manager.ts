import { env } from '../config/env.js';

export async function isPortInUse(_port: number): Promise<boolean> {
  // TODO: use net.createServer to probe the port
  return false;
}

export async function startServer(_port: number): Promise<void> {
  // TODO: spawn the server process and wait for it to be ready
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${env.API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
