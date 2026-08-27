-- AlterTable
ALTER TABLE `academic_setting` MODIFY `currentYear` VARCHAR(20) NOT NULL,
    MODIFY `currentPrincipalName` VARCHAR(100) NOT NULL,
    MODIFY `schoolName` VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE `classroom` MODIFY `name` VARCHAR(50) NOT NULL,
    MODIFY `academicYear` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `coordinator_profile` MODIFY `nip` VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE `group` MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `munaqasyah_schedule` MODIFY `sessionName` VARCHAR(100) NOT NULL,
    MODIFY `location` VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE `student_profile` MODIFY `nis` VARCHAR(30) NOT NULL,
    MODIFY `nisn` VARCHAR(30) NULL;

-- AlterTable
ALTER TABLE `tahsin_score` MODIFY `topic` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `tashih_schedule` MODIFY `sessionName` VARCHAR(100) NOT NULL,
    MODIFY `location` VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE `teacher_profile` MODIFY `nip` VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `username` VARCHAR(30) NOT NULL,
    MODIFY `phoneNumber` VARCHAR(20) NULL,
    MODIFY `birthPlace` VARCHAR(100) NULL;

