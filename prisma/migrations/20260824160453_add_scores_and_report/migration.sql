-- CreateTable
CREATE TABLE `tahfidz_score` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `surahId` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `grade` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tahfidz_score_studentId_groupId_surahId_key`(`studentId`, `groupId`, `surahId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tahsin_score` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `tahsinType` ENUM('WAFA', 'ALQURAN') NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `grade` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tahsin_score_studentId_groupId_tahsinType_topic_key`(`studentId`, `groupId`, `tahsinType`, `topic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `academicYear` VARCHAR(191) NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `tahfidzScore` DOUBLE NULL,
    `tahsinScore` DOUBLE NULL,
    `lastTahsinMaterial` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `report_studentId_groupId_academicYear_semester_key`(`studentId`, `groupId`, `academicYear`, `semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tahfidz_score` ADD CONSTRAINT `tahfidz_score_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tahfidz_score` ADD CONSTRAINT `tahfidz_score_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tahfidz_score` ADD CONSTRAINT `tahfidz_score_surahId_fkey` FOREIGN KEY (`surahId`) REFERENCES `surah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tahsin_score` ADD CONSTRAINT `tahsin_score_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tahsin_score` ADD CONSTRAINT `tahsin_score_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
