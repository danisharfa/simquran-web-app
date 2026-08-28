-- Per-surah initial score for Tasmi grading (superadmin-editable, default preserves current hardcoded 100)
ALTER TABLE "surah" ADD COLUMN "initialScore" INTEGER NOT NULL DEFAULT 100;

-- Configurable khofi/jali deduction weights per jenis ujian (superadmin-editable)
CREATE TABLE "munaqasyah_scoring_setting" (
    "jenis" "MunaqasyahJenisUjian" NOT NULL,
    "khofiAwalAyatWeight" INTEGER NOT NULL,
    "khofiMakhrojWeight" INTEGER NOT NULL,
    "khofiTajwidMadWeight" INTEGER NOT NULL,
    "jaliBarisWeight" INTEGER NOT NULL,
    "jaliLebihSatuKalimatWeight" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "munaqasyah_scoring_setting_pkey" PRIMARY KEY ("jenis")
);

-- Seed with the weights that were previously hardcoded, so behavior is unchanged until edited
INSERT INTO "munaqasyah_scoring_setting" ("jenis", "khofiAwalAyatWeight", "khofiMakhrojWeight", "khofiTajwidMadWeight", "jaliBarisWeight", "jaliLebihSatuKalimatWeight", "updatedAt")
VALUES
    ('TASMI', 2, 2, 2, 5, 5, CURRENT_TIMESTAMP),
    ('MUNAQASYAH', 2, 2, 2, 3, 3, CURRENT_TIMESTAMP);
