-- Configurable letter-grade thresholds/descriptions (superadmin-editable, replaces hardcoded computeGrade)
CREATE TABLE "grade_letter_setting" (
    "grade" "GradeLetter" NOT NULL,
    "minScore" INTEGER NOT NULL,
    "description" VARCHAR(50) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "grade_letter_setting_pkey" PRIMARY KEY ("grade")
);

INSERT INTO "grade_letter_setting" ("grade", "minScore", "description", "updatedAt")
VALUES
    ('A', 92, 'Sangat Baik', CURRENT_TIMESTAMP),
    ('B', 83, 'Baik', CURRENT_TIMESTAMP),
    ('C', 75, 'Cukup', CURRENT_TIMESTAMP),
    ('D', 0, 'Kurang', CURRENT_TIMESTAMP);

-- Configurable report description sentence templates (superadmin-editable)
CREATE TYPE "ReportTemplateType" AS ENUM ('TAHFIDZ', 'TAHSIN');

CREATE TABLE "report_description_template" (
    "type" "ReportTemplateType" NOT NULL,
    "template" VARCHAR(191) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "report_description_template_pkey" PRIMARY KEY ("type")
);

INSERT INTO "report_description_template" ("type", "template", "updatedAt")
VALUES
    ('TAHFIDZ', '{description} dalam menghafal {surahName}', CURRENT_TIMESTAMP),
    ('TAHSIN', '{description} dalam memahami {topic}', CURRENT_TIMESTAMP);
