-- DropForeignKey
ALTER TABLE `classroom_history` DROP FOREIGN KEY `classroom_history_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `group_history` DROP FOREIGN KEY `group_history_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `report_studentId_fkey`;

-- DropIndex
DROP INDEX `classroom_history_studentId_academicYear_semester_key` ON `classroom_history`;

-- DropIndex
DROP INDEX `group_history_studentId_academicYear_semester_key` ON `group_history`;

-- DropIndex
DROP INDEX `report_studentId_groupId_academicYear_semester_key` ON `report`;

-- CreateIndex
CREATE UNIQUE INDEX `classroom_history_studentId_classroomId_academicYear_semeste_key` ON `classroom_history`(`studentId`, `classroomId`, `academicYear`, `semester`);

-- CreateIndex
CREATE UNIQUE INDEX `group_history_studentId_groupId_academicYear_semester_key` ON `group_history`(`studentId`, `groupId`, `academicYear`, `semester`);

-- CreateIndex
CREATE UNIQUE INDEX `report_studentId_academicYear_semester_key` ON `report`(`studentId`, `academicYear`, `semester`);

-- AddForeignKey
ALTER TABLE `classroom_history` ADD CONSTRAINT `classroom_history_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_history` ADD CONSTRAINT `group_history_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student_profile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
