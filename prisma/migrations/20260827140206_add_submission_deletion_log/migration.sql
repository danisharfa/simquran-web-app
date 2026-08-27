-- CreateTable
CREATE TABLE `submission_deletion_log` (
    `id` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `teacherName` VARCHAR(191) NOT NULL,
    `groupName` VARCHAR(191) NOT NULL,
    `classroomName` VARCHAR(191) NOT NULL,
    `submissionDate` DATETIME(3) NOT NULL,
    `submissionType` ENUM('TAHFIDZ', 'TAHSIN_WAFA', 'TAHSIN_ALQURAN') NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `deletedByName` VARCHAR(191) NOT NULL,
    `deletedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `submission_deletion_log_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
