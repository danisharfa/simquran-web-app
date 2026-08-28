-- Configurable weight split (as percentages summing to 100) for combining a student's Tasmi and
-- Munaqasyah scores into the final MunaqasyahFinalResult score, replaces the hardcoded 70/30 split
-- in calculateFinalScore. Single global row, only editable by superadmin.
CREATE TABLE "munaqasyah_final_score_weight_setting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "tasmiWeight" INTEGER NOT NULL,
    "munaqasyahWeight" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "munaqasyah_final_score_weight_setting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "munaqasyah_final_score_weight_setting" ("id", "tasmiWeight", "munaqasyahWeight", "updatedAt")
VALUES ('singleton', 70, 30, CURRENT_TIMESTAMP);
