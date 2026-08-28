-- DropForeignKey
ALTER TABLE `home_activity` DROP FOREIGN KEY `home_activity_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `report_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `tahfidz_score` DROP FOREIGN KEY `tahfidz_score_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `tahsin_score` DROP FOREIGN KEY `tahsin_score_groupId_fkey`;

-- DropIndex
DROP INDEX `home_activity_groupId_fkey` ON `home_activity`;

-- DropIndex
DROP INDEX `report_groupId_fkey` ON `report`;

-- DropIndex
DROP INDEX `tahfidz_score_groupId_fkey` ON `tahfidz_score`;

-- DropIndex
DROP INDEX `tahsin_score_groupId_fkey` ON `tahsin_score`;

-- AddForeignKey
ALTER TABLE `home_activity` ADD CONSTRAINT `home_activity_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tahfidz_score` ADD CONSTRAINT `tahfidz_score_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tahsin_score` ADD CONSTRAINT `tahsin_score_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
