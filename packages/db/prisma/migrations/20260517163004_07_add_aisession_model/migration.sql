-- CreateTable
CREATE TABLE "ai_chat_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "adapterType" TEXT NOT NULL,
    "modelName" TEXT,
    "sessionId" TEXT,
    "sessionState" JSONB,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_chat_sessions_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ai_chat_sessions_userId_chatId_idx" ON "ai_chat_sessions"("userId", "chatId");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_provider_mode_adapterType_idx" ON "ai_chat_sessions"("provider", "mode", "adapterType");

-- CreateIndex
CREATE UNIQUE INDEX "ai_chat_sessions_chatId_provider_mode_adapterType_modelName_key" ON "ai_chat_sessions"("chatId", "provider", "mode", "adapterType", "modelName");
