/*
  Warnings:

  - Added the required column `level` to the `classroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `classroom` ADD COLUMN `level` INTEGER NOT NULL;
