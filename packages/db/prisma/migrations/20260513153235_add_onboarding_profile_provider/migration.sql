-- CreateTable
CREATE TABLE "user_onboarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStep" TEXT NOT NULL DEFAULT 'PROFILE',
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "goalCompleted" BOOLEAN NOT NULL DEFAULT false,
    "providerCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastSkippedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "provider_credentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "hasApiKey" BOOLEAN NOT NULL DEFAULT false,
    "apiKeyHash" TEXT,
    "apiKeyCiphertext" TEXT,
    "apiKeyIv" TEXT,
    "apiKeyAuthTag" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "isWorking" BOOLEAN NOT NULL DEFAULT false,
    "lastTestPassed" BOOLEAN,
    "lastTestedAt" DATETIME,
    "lastTestMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "provider_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" INTEGER,
    "goal" TEXT,
    "resumeDocumentId" TEXT,
    "onboardingStep" TEXT NOT NULL DEFAULT 'PROFILE',
    "isOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "phone", "updatedAt") SELECT "createdAt", "email", "id", "name", "phone", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_userId_key" ON "user_onboarding"("userId");

-- CreateIndex
CREATE INDEX "provider_credentials_userId_isSelected_idx" ON "provider_credentials"("userId", "isSelected");

-- CreateIndex
CREATE UNIQUE INDEX "provider_credentials_userId_provider_mode_key" ON "provider_credentials"("userId", "provider", "mode");
