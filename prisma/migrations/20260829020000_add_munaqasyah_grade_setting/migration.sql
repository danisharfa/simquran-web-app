-- Configurable predikat (grade) thresholds/labels for Munaqasyah, replaces hardcoded scoreToGrade.
-- JAYYID's minScore doubles as the passing threshold (KKM): passed = grade != TIDAK_LULUS.
CREATE TABLE "munaqasyah_grade_setting" (
    "grade" "MunaqasyahGrade" NOT NULL,
    "minScore" INTEGER NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "munaqasyah_grade_setting_pkey" PRIMARY KEY ("grade")
);

INSERT INTO "munaqasyah_grade_setting" ("grade", "minScore", "label", "updatedAt")
VALUES
    ('MUMTAZ', 91, 'Mumtaz', CURRENT_TIMESTAMP),
    ('JAYYID_JIDDAN', 85, 'Jayyid Jiddan', CURRENT_TIMESTAMP),
    ('JAYYID', 80, 'Jayyid', CURRENT_TIMESTAMP),
    ('TIDAK_LULUS', 0, 'Tidak Lulus', CURRENT_TIMESTAMP);
