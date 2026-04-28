/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the `auditlog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `studentprofile` DROP COLUMN `phoneNumber`;

-- DropTable
DROP TABLE `auditlog`;
