-- Revert: examinerId must reference teacher_profile again (coordinators grade by default without being assigned)
ALTER TABLE "munaqasyah_schedule" DROP CONSTRAINT "munaqasyah_schedule_examinerId_fkey";

ALTER TABLE "munaqasyah_schedule" ADD CONSTRAINT "munaqasyah_schedule_examinerId_fkey" FOREIGN KEY ("examinerId") REFERENCES "teacher_profile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
