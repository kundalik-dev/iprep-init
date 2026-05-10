import { prisma } from '../prisma.js';

export async function checkDbHealth(): Promise<boolean> {
  try {
    await prisma.health.count();
    return true;
  } catch {
    return false;
  }
}