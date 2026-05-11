import { prisma } from './prisma.js';

interface Migration {
  id: string;
  statements: string[];
}

const migrations: Migration[] = [
  {
    id: '20260509094321_init',
    statements: [
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
    ],
  },
  {
    id: '20260510030519_health_model',
    statements: [
      `CREATE TABLE IF NOT EXISTS "health" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "status" TEXT NOT NULL DEFAULT 'ok',
        "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ],
  },
];

export async function runDbMigrations(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_iprep_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const migration of migrations) {
    const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT "id" FROM "_iprep_migrations" WHERE "id" = ? LIMIT 1`,
      migration.id,
    );

    if (existing.length > 0) continue;

    await prisma.$transaction(async (tx) => {
      for (const statement of migration.statements) {
        await tx.$executeRawUnsafe(statement);
      }

      await tx.$executeRawUnsafe(
        `INSERT INTO "_iprep_migrations" ("id") VALUES (?)`,
        migration.id,
      );
    });
  }
}
