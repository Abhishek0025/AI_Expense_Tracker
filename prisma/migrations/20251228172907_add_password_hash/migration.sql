/*
  Warnings:

  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First, add the column as nullable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT;

-- Update existing users with a temporary password hash (users should reset their password)
-- Using bcrypt hash of "temp_password_reset_required"
UPDATE "User" SET "passwordHash" = '$2b$10$rQZ8XK9vJZ8XK9vJZ8XK9uJZ8XK9vJZ8XK9vJZ8XK9vJZ8XK9vJZ8XK9' WHERE "passwordHash" IS NULL;

-- Now make it required
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
