-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('TAHFIDZ', 'TAHSIN_WAFA', 'TAHSIN_ALQURAN');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('LULUS', 'TIDAK_LULUS', 'MENGULANG');

-- CreateEnum
CREATE TYPE "Adab" AS ENUM ('BAIK', 'KURANG_BAIK', 'TIDAK_BAIK');

-- CreateEnum
CREATE TYPE "HomeActivityType" AS ENUM ('MURAJAAH', 'TILAWAH', 'TARJAMAH');

-- CreateEnum
CREATE TYPE "HomeActivityStatus" AS ENUM ('BELUM_DIPERIKSA', 'SUDAH_DIPERIKSA');

-- CreateEnum
CREATE TYPE "TargetStatus" AS ENUM ('TIDAK_TERCAPAI', 'TERCAPAI');

-- CreateEnum
CREATE TYPE "TashihType" AS ENUM ('ALQURAN', 'WAFA');

-- CreateEnum
CREATE TYPE "TashihRequestStatus" AS ENUM ('MENUNGGU', 'DITERIMA', 'DITOLAK', 'SELESAI');

-- CreateEnum
CREATE TYPE "GradeLetter" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "TahsinType" AS ENUM ('WAFA', 'ALQURAN');

-- CreateEnum
CREATE TYPE "MunaqasyahTahap" AS ENUM ('TAHAP_1', 'TAHAP_2', 'TAHAP_3', 'TAHAP_4');

-- CreateEnum
CREATE TYPE "MunaqasyahJenisUjian" AS ENUM ('TASMI', 'MUNAQASYAH');

-- CreateEnum
CREATE TYPE "MunaqasyahRequestStatus" AS ENUM ('MENUNGGU', 'DITERIMA', 'DITOLAK', 'SELESAI');

-- CreateEnum
CREATE TYPE "MunaqasyahGrade" AS ENUM ('MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'TIDAK_LULUS');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('GANJIL', 'GENAP');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A', 'B', 'AB', 'O');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('AKTIF', 'LULUS', 'PINDAH', 'KELUAR');

-- CreateTable
CREATE TABLE "academic_setting" (
    "id" TEXT NOT NULL,
    "currentYear" VARCHAR(20) NOT NULL,
    "currentSemester" "Semester" NOT NULL,
    "currentPrincipalName" VARCHAR(100) NOT NULL,
    "schoolName" VARCHAR(150) NOT NULL,
    "schoolAddress" VARCHAR(191) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "academic_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(191),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "username" VARCHAR(30) NOT NULL,
    "displayUsername" TEXT,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "phoneNumber" VARCHAR(20),
    "birthDate" TIMESTAMP(3),
    "birthPlace" VARCHAR(100),
    "address" VARCHAR(191),
    "gender" "Gender",
    "bloodType" "BloodType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordinator_profile" (
    "userId" TEXT NOT NULL,
    "nip" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordinator_profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "teacher_profile" (
    "userId" TEXT NOT NULL,
    "nip" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "student_profile" (
    "userId" TEXT NOT NULL,
    "nis" VARCHAR(30) NOT NULL,
    "nisn" VARCHAR(30),
    "classroomId" TEXT,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'AKTIF',
    "graduatedAt" TIMESTAMP(3),
    "exitedAt" TIMESTAMP(3),

    CONSTRAINT "student_profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "classroom" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "academicYear" VARCHAR(20) NOT NULL,
    "semester" "Semester" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_history" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classroom_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "classroomId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_history" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surah" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "verseCount" INTEGER NOT NULL,

    CONSTRAINT "surah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "juz" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "juz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surah_juz" (
    "id" INTEGER NOT NULL,
    "surahId" INTEGER NOT NULL,
    "juzId" INTEGER NOT NULL,
    "startVerse" INTEGER NOT NULL,
    "endVerse" INTEGER NOT NULL,

    CONSTRAINT "surah_juz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wafa" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,

    CONSTRAINT "wafa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "submissionType" "SubmissionType" NOT NULL,
    "juzId" INTEGER,
    "surahId" INTEGER,
    "startVerse" INTEGER,
    "endVerse" INTEGER,
    "wafaId" INTEGER,
    "startPage" INTEGER,
    "endPage" INTEGER,
    "adab" "Adab" NOT NULL,
    "submissionStatus" "SubmissionStatus" NOT NULL,
    "note" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_deletion_log" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "classroomName" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL,
    "submissionType" "SubmissionType" NOT NULL,
    "detail" TEXT NOT NULL,
    "note" TEXT,
    "deletedByName" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_deletion_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_activity" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activityType" "HomeActivityType" NOT NULL,
    "juzId" INTEGER NOT NULL,
    "surahId" INTEGER NOT NULL,
    "startVerse" INTEGER NOT NULL,
    "endVerse" INTEGER NOT NULL,
    "note" VARCHAR(191),
    "status" "HomeActivityStatus" NOT NULL DEFAULT 'BELUM_DIPERIKSA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_target" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "type" "SubmissionType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(191) NOT NULL,
    "status" "TargetStatus" NOT NULL DEFAULT 'TIDAK_TERCAPAI',
    "progressPercent" INTEGER DEFAULT 0,
    "surahStartId" INTEGER,
    "surahEndId" INTEGER,
    "startAyat" INTEGER,
    "endAyat" INTEGER,
    "juzStartId" INTEGER,
    "juzEndId" INTEGER,
    "wafaId" INTEGER,
    "startPage" INTEGER,
    "endPage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tashih_request" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "coordinatorId" TEXT,
    "tashihType" "TashihType" NOT NULL,
    "juzId" INTEGER,
    "surahId" INTEGER,
    "wafaId" INTEGER,
    "startPage" INTEGER,
    "endPage" INTEGER,
    "status" "TashihRequestStatus" NOT NULL DEFAULT 'MENUNGGU',
    "notes" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tashih_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tashih_schedule" (
    "id" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sessionName" VARCHAR(100) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tashih_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tashih_schedule_request" (
    "scheduleId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "tashih_schedule_request_pkey" PRIMARY KEY ("scheduleId","requestId")
);

-- CreateTable
CREATE TABLE "tashih_result" (
    "id" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tashih_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahfidz_score" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "surahId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" "GradeLetter" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahfidz_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahsin_score" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "tahsinType" "TahsinType" NOT NULL,
    "topic" VARCHAR(100) NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" "GradeLetter" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahsin_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "tahfidzScore" DOUBLE PRECISION,
    "tahsinScore" DOUBLE PRECISION,
    "lastTahsinMaterial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "munaqasyah_request" (
    "id" TEXT NOT NULL,
    "coordinatorId" TEXT,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "tahap" "MunaqasyahTahap" NOT NULL,
    "jenis" "MunaqasyahJenisUjian" NOT NULL,
    "juzId" INTEGER NOT NULL,
    "status" "MunaqasyahRequestStatus" NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "munaqasyah_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "munaqasyah_schedule" (
    "id" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sessionName" VARCHAR(100) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "examinerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "munaqasyah_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "munaqasyah_schedule_request" (
    "scheduleId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "munaqasyah_schedule_request_pkey" PRIMARY KEY ("scheduleId","requestId")
);

-- CreateTable
CREATE TABLE "munaqasyah_result" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "grade" "MunaqasyahGrade" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "munaqasyah_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasmi_detail" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "surahId" INTEGER NOT NULL,
    "initialScore" INTEGER NOT NULL,
    "khofiAwalAyat" INTEGER NOT NULL,
    "khofiMakhroj" INTEGER NOT NULL,
    "khofiTajwidMad" INTEGER NOT NULL,
    "jaliBaris" INTEGER NOT NULL,
    "jaliLebihSatuKalimat" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasmi_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "munaqasyah_detail" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "initialScore" INTEGER NOT NULL DEFAULT 50,
    "khofiAwalAyat" INTEGER NOT NULL,
    "khofiMakhroj" INTEGER NOT NULL,
    "khofiTajwidMad" INTEGER NOT NULL,
    "jaliBaris" INTEGER NOT NULL,
    "jaliLebihSatuKalimat" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "munaqasyah_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "munaqasyah_final_result" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "juzId" INTEGER NOT NULL,
    "tahap" "MunaqasyahTahap" NOT NULL,
    "tasmiResultId" TEXT NOT NULL,
    "munaqasyahResultId" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "finalGrade" "MunaqasyahGrade" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "munaqasyah_final_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "coordinator_profile_nip_key" ON "coordinator_profile"("nip");

-- CreateIndex
CREATE INDEX "coordinator_profile_nip_idx" ON "coordinator_profile"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profile_nip_key" ON "teacher_profile"("nip");

-- CreateIndex
CREATE INDEX "teacher_profile_nip_idx" ON "teacher_profile"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "student_profile_nis_key" ON "student_profile"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "student_profile_nisn_key" ON "student_profile"("nisn");

-- CreateIndex
CREATE INDEX "student_profile_nis_idx" ON "student_profile"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_id_key" ON "classroom"("id");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_name_academicYear_semester_key" ON "classroom"("name", "academicYear", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_history_studentId_classroomId_academicYear_semest_key" ON "classroom_history"("studentId", "classroomId", "academicYear", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "group_id_key" ON "group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "group_name_classroomId_key" ON "group"("name", "classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "group_history_studentId_groupId_academicYear_semester_key" ON "group_history"("studentId", "groupId", "academicYear", "semester");

-- CreateIndex
CREATE INDEX "surah_juz_surahId_idx" ON "surah_juz"("surahId");

-- CreateIndex
CREATE INDEX "surah_juz_juzId_idx" ON "surah_juz"("juzId");

-- CreateIndex
CREATE INDEX "submission_date_idx" ON "submission"("date");

-- CreateIndex
CREATE INDEX "submission_deletion_log_deletedAt_idx" ON "submission_deletion_log"("deletedAt");

-- CreateIndex
CREATE INDEX "home_activity_date_idx" ON "home_activity"("date");

-- CreateIndex
CREATE INDEX "weekly_target_startDate_idx" ON "weekly_target"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "tashih_schedule_date_sessionName_startTime_endTime_location_key" ON "tashih_schedule"("date", "sessionName", "startTime", "endTime", "location");

-- CreateIndex
CREATE UNIQUE INDEX "tashih_result_requestId_key" ON "tashih_result"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "tashih_result_scheduleId_requestId_key" ON "tashih_result"("scheduleId", "requestId");

-- CreateIndex
CREATE UNIQUE INDEX "tahfidz_score_studentId_groupId_surahId_key" ON "tahfidz_score"("studentId", "groupId", "surahId");

-- CreateIndex
CREATE UNIQUE INDEX "tahsin_score_studentId_groupId_tahsinType_topic_key" ON "tahsin_score"("studentId", "groupId", "tahsinType", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "report_studentId_academicYear_semester_key" ON "report"("studentId", "academicYear", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "munaqasyah_schedule_date_sessionName_startTime_endTime_loca_key" ON "munaqasyah_schedule"("date", "sessionName", "startTime", "endTime", "location");

-- CreateIndex
CREATE UNIQUE INDEX "munaqasyah_result_requestId_key" ON "munaqasyah_result"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "munaqasyah_result_requestId_scheduleId_key" ON "munaqasyah_result"("requestId", "scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "tasmi_detail_resultId_surahId_key" ON "tasmi_detail"("resultId", "surahId");

-- CreateIndex
CREATE UNIQUE INDEX "munaqasyah_detail_resultId_questionNo_key" ON "munaqasyah_detail"("resultId", "questionNo");

-- CreateIndex
CREATE UNIQUE INDEX "munaqasyah_final_result_tasmiResultId_key" ON "munaqasyah_final_result"("tasmiResultId");

-- CreateIndex
CREATE UNIQUE INDEX "munaqasyah_final_result_munaqasyahResultId_key" ON "munaqasyah_final_result"("munaqasyahResultId");

-- CreateIndex
CREATE UNIQUE INDEX "munaqasyah_final_result_studentId_juzId_tahap_key" ON "munaqasyah_final_result"("studentId", "juzId", "tahap");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinator_profile" ADD CONSTRAINT "coordinator_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profile" ADD CONSTRAINT "teacher_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_history" ADD CONSTRAINT "classroom_history_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_history" ADD CONSTRAINT "classroom_history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_history" ADD CONSTRAINT "group_history_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_history" ADD CONSTRAINT "group_history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surah_juz" ADD CONSTRAINT "surah_juz_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surah_juz" ADD CONSTRAINT "surah_juz_juzId_fkey" FOREIGN KEY ("juzId") REFERENCES "juz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_juzId_fkey" FOREIGN KEY ("juzId") REFERENCES "juz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "surah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_wafaId_fkey" FOREIGN KEY ("wafaId") REFERENCES "wafa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_activity" ADD CONSTRAINT "home_activity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_activity" ADD CONSTRAINT "home_activity_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_activity" ADD CONSTRAINT "home_activity_juzId_fkey" FOREIGN KEY ("juzId") REFERENCES "juz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_activity" ADD CONSTRAINT "home_activity_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_surahStartId_fkey" FOREIGN KEY ("surahStartId") REFERENCES "surah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_surahEndId_fkey" FOREIGN KEY ("surahEndId") REFERENCES "surah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_juzStartId_fkey" FOREIGN KEY ("juzStartId") REFERENCES "juz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_juzEndId_fkey" FOREIGN KEY ("juzEndId") REFERENCES "juz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_target" ADD CONSTRAINT "weekly_target_wafaId_fkey" FOREIGN KEY ("wafaId") REFERENCES "wafa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_request" ADD CONSTRAINT "tashih_request_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_request" ADD CONSTRAINT "tashih_request_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_request" ADD CONSTRAINT "tashih_request_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_request" ADD CONSTRAINT "tashih_request_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "coordinator_profile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_request" ADD CONSTRAINT "tashih_request_juzId_fkey" FOREIGN KEY ("juzId") REFERENCES "juz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_request" ADD CONSTRAINT "tashih_request_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "surah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_request" ADD CONSTRAINT "tashih_request_wafaId_fkey" FOREIGN KEY ("wafaId") REFERENCES "wafa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_schedule" ADD CONSTRAINT "tashih_schedule_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "coordinator_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_schedule_request" ADD CONSTRAINT "tashih_schedule_request_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "tashih_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_schedule_request" ADD CONSTRAINT "tashih_schedule_request_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "tashih_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_result" ADD CONSTRAINT "tashih_result_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "coordinator_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_result" ADD CONSTRAINT "tashih_result_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "tashih_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tashih_result" ADD CONSTRAINT "tashih_result_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "tashih_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahfidz_score" ADD CONSTRAINT "tahfidz_score_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahfidz_score" ADD CONSTRAINT "tahfidz_score_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahfidz_score" ADD CONSTRAINT "tahfidz_score_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsin_score" ADD CONSTRAINT "tahsin_score_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsin_score" ADD CONSTRAINT "tahsin_score_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_request" ADD CONSTRAINT "munaqasyah_request_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "coordinator_profile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_request" ADD CONSTRAINT "munaqasyah_request_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_request" ADD CONSTRAINT "munaqasyah_request_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_request" ADD CONSTRAINT "munaqasyah_request_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_request" ADD CONSTRAINT "munaqasyah_request_juzId_fkey" FOREIGN KEY ("juzId") REFERENCES "juz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_schedule" ADD CONSTRAINT "munaqasyah_schedule_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "coordinator_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_schedule" ADD CONSTRAINT "munaqasyah_schedule_examinerId_fkey" FOREIGN KEY ("examinerId") REFERENCES "teacher_profile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_schedule_request" ADD CONSTRAINT "munaqasyah_schedule_request_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "munaqasyah_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_schedule_request" ADD CONSTRAINT "munaqasyah_schedule_request_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "munaqasyah_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_result" ADD CONSTRAINT "munaqasyah_result_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "munaqasyah_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_result" ADD CONSTRAINT "munaqasyah_result_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "munaqasyah_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasmi_detail" ADD CONSTRAINT "tasmi_detail_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "munaqasyah_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasmi_detail" ADD CONSTRAINT "tasmi_detail_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_detail" ADD CONSTRAINT "munaqasyah_detail_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "munaqasyah_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_final_result" ADD CONSTRAINT "munaqasyah_final_result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_final_result" ADD CONSTRAINT "munaqasyah_final_result_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_final_result" ADD CONSTRAINT "munaqasyah_final_result_juzId_fkey" FOREIGN KEY ("juzId") REFERENCES "juz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_final_result" ADD CONSTRAINT "munaqasyah_final_result_tasmiResultId_fkey" FOREIGN KEY ("tasmiResultId") REFERENCES "munaqasyah_result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "munaqasyah_final_result" ADD CONSTRAINT "munaqasyah_final_result_munaqasyahResultId_fkey" FOREIGN KEY ("munaqasyahResultId") REFERENCES "munaqasyah_result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
