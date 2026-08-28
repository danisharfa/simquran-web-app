-- Enforce 0-100 range at the DB level too (app already validates via Zod, this is defense in depth)
ALTER TABLE "tahfidz_score" ADD CONSTRAINT "tahfidz_score_score_range_check" CHECK ("score" >= 0 AND "score" <= 100);
ALTER TABLE "tahsin_score" ADD CONSTRAINT "tahsin_score_score_range_check" CHECK ("score" >= 0 AND "score" <= 100);
