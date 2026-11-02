-- One-time migration: simplified application pipeline + current_round_id
-- Run ONLY when upgrading an existing DB (skip on fresh install from current schema.sql).
-- Order: backup DB → run this file → then source procedures.sql

ALTER TABLE application MODIFY COLUMN status VARCHAR(32) NOT NULL DEFAULT 'Applied';

UPDATE application SET status = 'In_Round' WHERE status IN ('Interviewing', 'In-Round');
UPDATE application SET status = 'Shortlisted' WHERE status = 'OA_Pending';

ALTER TABLE application ADD COLUMN current_round_id INT NULL;

UPDATE application a
JOIN (SELECT job_id, MIN(round_id) AS rid FROM round GROUP BY job_id) x ON x.job_id = a.job_id
SET a.current_round_id = x.rid
WHERE a.status IN ('Shortlisted', 'In_Round') AND a.current_round_id IS NULL;

ALTER TABLE application MODIFY COLUMN status ENUM(
  'Applied', 'Shortlisted', 'In_Round', 'Selected', 'Rejected'
) NOT NULL DEFAULT 'Applied';

ALTER TABLE application ADD CONSTRAINT fk_application_current_round
  FOREIGN KEY (current_round_id) REFERENCES round(round_id) ON DELETE SET NULL;
