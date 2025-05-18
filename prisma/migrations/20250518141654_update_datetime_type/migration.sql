/*
  Warnings:

  - Made the column `dateTime` on table `Route` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Route" ALTER COLUMN "dateTime" SET NOT NULL;
