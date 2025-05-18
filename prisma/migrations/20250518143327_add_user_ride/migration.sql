/*
  Warnings:

  - Added the required column `userId` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRideStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserRide" (
    "id" TEXT NOT NULL,
    "status" "UserRideStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,

    CONSTRAINT "UserRide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRide_userId_idx" ON "UserRide"("userId");

-- CreateIndex
CREATE INDEX "UserRide_routeId_idx" ON "UserRide"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRide_userId_routeId_key" ON "UserRide"("userId", "routeId");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_idx" ON "VerificationToken"("userId");

-- AddForeignKey
ALTER TABLE "UserRide" ADD CONSTRAINT "UserRide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRide" ADD CONSTRAINT "UserRide_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
