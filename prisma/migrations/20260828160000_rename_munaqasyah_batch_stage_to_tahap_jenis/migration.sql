-- Rename `batch` -> `tahap` and `stage` -> `jenis` on munaqasyah_request (data preserved via CHANGE COLUMN)
ALTER TABLE `munaqasyah_request`
    CHANGE COLUMN `batch` `tahap` ENUM('TAHAP_1', 'TAHAP_2', 'TAHAP_3', 'TAHAP_4') NOT NULL,
    CHANGE COLUMN `stage` `jenis` ENUM('TASMI', 'MUNAQASYAH') NOT NULL;

-- Rename `batch` -> `tahap` on munaqasyah_final_result (data preserved via CHANGE COLUMN)
ALTER TABLE `munaqasyah_final_result`
    CHANGE COLUMN `batch` `tahap` ENUM('TAHAP_1', 'TAHAP_2', 'TAHAP_3', 'TAHAP_4') NOT NULL;

-- Rename the compound unique index to match the renamed column
ALTER TABLE `munaqasyah_final_result`
    RENAME INDEX `munaqasyah_final_result_studentId_juzId_batch_key` TO `munaqasyah_final_result_studentId_juzId_tahap_key`;
