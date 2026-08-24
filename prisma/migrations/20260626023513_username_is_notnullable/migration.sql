/*
  Warnings:

  - Made the column `username` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `displayUsername` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `username` VARCHAR(191) NOT NULL,
    MODIFY `displayUsername` VARCHAR(191) NOT NULL;
