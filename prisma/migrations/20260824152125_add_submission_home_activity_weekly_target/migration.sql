-- CreateTable
CREATE TABLE `submission` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `submissionType` ENUM('TAHFIDZ', 'TAHSIN_WAFA', 'TAHSIN_ALQURAN') NOT NULL,
    `juzId` INTEGER NULL,
    `surahId` INTEGER NULL,
    `startVerse` INTEGER NULL,
    `endVerse` INTEGER NULL,
    `wafaId` INTEGER NULL,
    `startPage` INTEGER NULL,
    `endPage` INTEGER NULL,
    `adab` ENUM('BAIK', 'KURANG_BAIK', 'TIDAK_BAIK') NOT NULL,
    `submissionStatus` ENUM('LULUS', 'TIDAK_LULUS', 'MENGULANG') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `submission_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_activity` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `activityType` ENUM('MURAJAAH', 'TILAWAH', 'TARJAMAH') NOT NULL,
    `juzId` INTEGER NOT NULL,
    `surahId` INTEGER NOT NULL,
    `startVerse` INTEGER NOT NULL,
    `endVerse` INTEGER NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `home_activity_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_target` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `type` ENUM('TAHFIDZ', 'TAHSIN_WAFA', 'TAHSIN_ALQURAN') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('TIDAK_TERCAPAI', 'TERCAPAI') NOT NULL DEFAULT 'TIDAK_TERCAPAI',
    `progressPercent` INTEGER NULL DEFAULT 0,
    `surahStartId` INTEGER NULL,
    `surahEndId` INTEGER NULL,
    `startAyat` INTEGER NULL,
    `endAyat` INTEGER NULL,
    `wafaId` INTEGER NULL,
    `startPage` INTEGER NULL,
    `endPage` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `weekly_target_startDate_idx`(`startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_juzId_fkey` FOREIGN KEY (`juzId`) REFERENCES `juz`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_surahId_fkey` FOREIGN KEY (`surahId`) REFERENCES `surah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_wafaId_fkey` FOREIGN KEY (`wafaId`) REFERENCES `wafa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_activity` ADD CONSTRAINT `home_activity_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_activity` ADD CONSTRAINT `home_activity_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_activity` ADD CONSTRAINT `home_activity_juzId_fkey` FOREIGN KEY (`juzId`) REFERENCES `juz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_activity` ADD CONSTRAINT `home_activity_surahId_fkey` FOREIGN KEY (`surahId`) REFERENCES `surah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_surahStartId_fkey` FOREIGN KEY (`surahStartId`) REFERENCES `surah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_surahEndId_fkey` FOREIGN KEY (`surahEndId`) REFERENCES `surah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_target` ADD CONSTRAINT `weekly_target_wafaId_fkey` FOREIGN KEY (`wafaId`) REFERENCES `wafa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
