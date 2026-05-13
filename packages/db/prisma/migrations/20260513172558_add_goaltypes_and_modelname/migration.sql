-- AlterTable
ALTER TABLE "provider_credentials" ADD COLUMN "modelName" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "goalTypes" JSONB;
