-- Allow munaqasyah_schedule.examinerId to reference any user (teacher or coordinator), not just teacher_profile
ALTER TABLE "munaqasyah_schedule" DROP CONSTRAINT "munaqasyah_schedule_examinerId_fkey";

ALTER TABLE "munaqasyah_schedule" ADD CONSTRAINT "munaqasyah_schedule_examinerId_fkey" FOREIGN KEY ("examinerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
