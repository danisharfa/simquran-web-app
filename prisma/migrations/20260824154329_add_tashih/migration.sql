-- CreateTable
CREATE TABLE `tashih_request` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `coordinatorId` VARCHAR(191) NULL,
    `tashihType` ENUM('ALQURAN', 'WAFA') NOT NULL,
    `juzId` INTEGER NULL,
    `surahId` INTEGER NULL,
    `wafaId` INTEGER NULL,
    `startPage` INTEGER NULL,
    `endPage` INTEGER NULL,
    `status` ENUM('MENUNGGU', 'DITERIMA', 'DITOLAK', 'SELESAI') NOT NULL DEFAULT 'MENUNGGU',
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tashih_schedule` (
    `id` VARCHAR(191) NOT NULL,
    `coordinatorId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `sessionName` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tashih_schedule_date_sessionName_startTime_endTime_location_key`(`date`, `sessionName`, `startTime`, `endTime`, `location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tashih_schedule_request` (
    `scheduleId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`scheduleId`, `requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tashih_result` (
    `id` VARCHAR(191) NOT NULL,
    `coordinatorId` VARCHAR(191) NOT NULL,
    `scheduleId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tashih_result_requestId_key`(`requestId`),
    UNIQUE INDEX `tashih_result_scheduleId_requestId_key`(`scheduleId`, `requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tashih_request` ADD CONSTRAINT `tashih_request_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_request` ADD CONSTRAINT `tashih_request_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_request` ADD CONSTRAINT `tashih_request_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_request` ADD CONSTRAINT `tashih_request_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `coordinator_profile`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_request` ADD CONSTRAINT `tashih_request_juzId_fkey` FOREIGN KEY (`juzId`) REFERENCES `juz`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_request` ADD CONSTRAINT `tashih_request_surahId_fkey` FOREIGN KEY (`surahId`) REFERENCES `surah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_request` ADD CONSTRAINT `tashih_request_wafaId_fkey` FOREIGN KEY (`wafaId`) REFERENCES `wafa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_schedule` ADD CONSTRAINT `tashih_schedule_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `coordinator_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_schedule_request` ADD CONSTRAINT `tashih_schedule_request_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `tashih_schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_schedule_request` ADD CONSTRAINT `tashih_schedule_request_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `tashih_request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_result` ADD CONSTRAINT `tashih_result_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `coordinator_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_result` ADD CONSTRAINT `tashih_result_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `tashih_schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tashih_result` ADD CONSTRAINT `tashih_result_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `tashih_request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
