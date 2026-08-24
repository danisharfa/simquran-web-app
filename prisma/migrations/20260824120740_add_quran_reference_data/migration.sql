-- DropForeignKey
ALTER TABLE `classroom_history` DROP FOREIGN KEY `classroom_history_classroomId_fkey`;

-- DropIndex
DROP INDEX `classroom_history_classroomId_fkey` ON `classroom_history`;

-- CreateTable
CREATE TABLE `surah` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `verseCount` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `juz` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surah_juz` (
    `id` INTEGER NOT NULL,
    `surahId` INTEGER NOT NULL,
    `juzId` INTEGER NOT NULL,
    `startVerse` INTEGER NOT NULL,
    `endVerse` INTEGER NOT NULL,

    INDEX `surah_juz_surahId_idx`(`surahId`),
    INDEX `surah_juz_juzId_idx`(`juzId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wafa` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `pageCount` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `classroom_history` ADD CONSTRAINT `classroom_history_classroomId_fkey` FOREIGN KEY (`classroomId`) REFERENCES `classroom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surah_juz` ADD CONSTRAINT `surah_juz_surahId_fkey` FOREIGN KEY (`surahId`) REFERENCES `surah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surah_juz` ADD CONSTRAINT `surah_juz_juzId_fkey` FOREIGN KEY (`juzId`) REFERENCES `juz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
