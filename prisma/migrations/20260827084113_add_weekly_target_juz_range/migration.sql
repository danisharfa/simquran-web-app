-- AlterTable
ALTER TABLE `weekly_target` ADD COLUMN `juzEndId` INTEGER NULL,
    ADD COLUMN `juzStartId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_juzStartId_fkey` FOREIGN KEY (`juzStartId`) REFERENCES `juz`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_juzEndId_fkey` FOREIGN KEY (`juzEndId`) REFERENCES `juz`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
