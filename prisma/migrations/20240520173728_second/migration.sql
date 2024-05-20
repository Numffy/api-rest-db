/*
  Warnings:

  - Added the required column `hour` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "hour" TEXT NOT NULL;
