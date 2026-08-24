-- CreateTable
CREATE TABLE `munaqasyah_request` (
    `id` VARCHAR(191) NOT NULL,
    `coordinatorId` VARCHAR(191) NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `batch` ENUM('TAHAP_1', 'TAHAP_2', 'TAHAP_3', 'TAHAP_4') NOT NULL,
    `stage` ENUM('TASMI', 'MUNAQASYAH') NOT NULL,
    `juzId` INTEGER NOT NULL,
    `status` ENUM('MENUNGGU', 'DITERIMA', 'DITOLAK', 'SELESAI') NOT NULL DEFAULT 'MENUNGGU',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `munaqasyah_schedule` (
    `id` VARCHAR(191) NOT NULL,
    `coordinatorId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `sessionName` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `examinerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `munaqasyah_schedule_date_sessionName_startTime_endTime_locat_key`(`date`, `sessionName`, `startTime`, `endTime`, `location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `munaqasyah_schedule_request` (
    `scheduleId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`scheduleId`, `requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `munaqasyah_result` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `scheduleId` VARCHAR(191) NOT NULL,
    `totalScore` DOUBLE NOT NULL,
    `grade` ENUM('MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'TIDAK_LULUS') NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `munaqasyah_result_requestId_key`(`requestId`),
    UNIQUE INDEX `munaqasyah_result_requestId_scheduleId_key`(`requestId`, `scheduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasmi_detail` (
    `id` VARCHAR(191) NOT NULL,
    `resultId` VARCHAR(191) NOT NULL,
    `surahId` INTEGER NOT NULL,
    `initialScore` INTEGER NOT NULL,
    `khofiAwalAyat` INTEGER NOT NULL,
    `khofiMakhroj` INTEGER NOT NULL,
    `khofiTajwidMad` INTEGER NOT NULL,
    `jaliBaris` INTEGER NOT NULL,
    `jaliLebihSatuKalimat` INTEGER NOT NULL,
    `totalScore` DOUBLE NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tasmi_detail_resultId_surahId_key`(`resultId`, `surahId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `munaqasyah_detail` (
    `id` VARCHAR(191) NOT NULL,
    `resultId` VARCHAR(191) NOT NULL,
    `questionNo` INTEGER NOT NULL,
    `initialScore` INTEGER NOT NULL DEFAULT 50,
    `khofiAwalAyat` INTEGER NOT NULL,
    `khofiMakhroj` INTEGER NOT NULL,
    `khofiTajwidMad` INTEGER NOT NULL,
    `jaliBaris` INTEGER NOT NULL,
    `jaliLebihSatuKalimat` INTEGER NOT NULL,
    `totalScore` DOUBLE NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `munaqasyah_detail_resultId_questionNo_key`(`resultId`, `questionNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `munaqasyah_final_result` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `juzId` INTEGER NOT NULL,
    `batch` ENUM('TAHAP_1', 'TAHAP_2', 'TAHAP_3', 'TAHAP_4') NOT NULL,
    `tasmiResultId` VARCHAR(191) NOT NULL,
    `munaqasyahResultId` VARCHAR(191) NOT NULL,
    `finalScore` DOUBLE NOT NULL,
    `finalGrade` ENUM('MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'TIDAK_LULUS') NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `munaqasyah_final_result_tasmiResultId_key`(`tasmiResultId`),
    UNIQUE INDEX `munaqasyah_final_result_munaqasyahResultId_key`(`munaqasyahResultId`),
    UNIQUE INDEX `munaqasyah_final_result_studentId_juzId_batch_key`(`studentId`, `juzId`, `batch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `munaqasyah_request` ADD CONSTRAINT `munaqasyah_request_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `coordinator_profile`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_request` ADD CONSTRAINT `munaqasyah_request_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_request` ADD CONSTRAINT `munaqasyah_request_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_request` ADD CONSTRAINT `munaqasyah_request_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_request` ADD CONSTRAINT `munaqasyah_request_juzId_fkey` FOREIGN KEY (`juzId`) REFERENCES `juz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_schedule` ADD CONSTRAINT `munaqasyah_schedule_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `coordinator_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_schedule` ADD CONSTRAINT `munaqasyah_schedule_examinerId_fkey` FOREIGN KEY (`examinerId`) REFERENCES `teacher_profile`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_schedule_request` ADD CONSTRAINT `munaqasyah_schedule_request_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `munaqasyah_schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_schedule_request` ADD CONSTRAINT `munaqasyah_schedule_request_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `munaqasyah_request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_result` ADD CONSTRAINT `munaqasyah_result_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `munaqasyah_request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_result` ADD CONSTRAINT `munaqasyah_result_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `munaqasyah_schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasmi_detail` ADD CONSTRAINT `tasmi_detail_resultId_fkey` FOREIGN KEY (`resultId`) REFERENCES `munaqasyah_result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasmi_detail` ADD CONSTRAINT `tasmi_detail_surahId_fkey` FOREIGN KEY (`surahId`) REFERENCES `surah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_detail` ADD CONSTRAINT `munaqasyah_detail_resultId_fkey` FOREIGN KEY (`resultId`) REFERENCES `munaqasyah_result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_final_result` ADD CONSTRAINT `munaqasyah_final_result_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_final_result` ADD CONSTRAINT `munaqasyah_final_result_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_final_result` ADD CONSTRAINT `munaqasyah_final_result_juzId_fkey` FOREIGN KEY (`juzId`) REFERENCES `juz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_final_result` ADD CONSTRAINT `munaqasyah_final_result_tasmiResultId_fkey` FOREIGN KEY (`tasmiResultId`) REFERENCES `munaqasyah_result`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `munaqasyah_final_result` ADD CONSTRAINT `munaqasyah_final_result_munaqasyahResultId_fkey` FOREIGN KEY (`munaqasyahResultId`) REFERENCES `munaqasyah_result`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
