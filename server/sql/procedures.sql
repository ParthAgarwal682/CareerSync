DELIMITER $$

-- 1. Function: CheckEligibility
DROP FUNCTION IF EXISTS CheckEligibility$$
CREATE FUNCTION CheckEligibility(p_student_id INT, p_job_id INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE v_stu_cgpa DECIMAL(4,2);
    DECLARE v_stu_backlogs INT;
    DECLARE v_stu_branch VARCHAR(50);
    DECLARE v_job_min_cgpa DECIMAL(4,2);
    DECLARE v_job_max_backlogs INT;
    DECLARE v_branch_match INT;
    
    SELECT cgpa, active_backlogs, branch INTO v_stu_cgpa, v_stu_backlogs, v_stu_branch
    FROM student WHERE student_id = p_student_id;
    
    SELECT min_cgpa, max_backlogs INTO v_job_min_cgpa, v_job_max_backlogs
    FROM job WHERE job_id = p_job_id;
    
    -- Check branch eligibility
    SELECT COUNT(*) INTO v_branch_match
    FROM job_branches WHERE job_id = p_job_id AND branch_name = v_stu_branch;
    
    IF v_branch_match = 0 THEN
        RETURN 'Branch not eligible';
    ELSEIF v_stu_cgpa < v_job_min_cgpa THEN
        RETURN 'CGPA too low';
    ELSEIF v_stu_backlogs > v_job_max_backlogs THEN
        RETURN 'Too many active backlogs';
    ELSE
        RETURN 'Eligible';
    END IF;
END$$

-- 2. Procedure: UpdateApplicationStatus (optional p_round_id when status = In_Round)
DROP PROCEDURE IF EXISTS UpdateApplicationStatus$$
CREATE PROCEDURE UpdateApplicationStatus(
    IN p_app_id INT,
    IN p_new_status VARCHAR(20),
    IN p_round_id INT
)
BEGIN
    DECLARE v_job INT DEFAULT NULL;
    DECLARE v_first_round INT DEFAULT NULL;

    SELECT job_id INTO v_job FROM application WHERE application_id = p_app_id LIMIT 1;

    IF p_new_status = 'Selected' THEN
        UPDATE application SET status = 'Selected', current_round_id = NULL WHERE application_id = p_app_id;
        UPDATE student s
        JOIN application a ON s.student_id = a.student_id
        SET s.placement_status = 'Placed'
        WHERE a.application_id = p_app_id;
    ELSEIF p_new_status = 'Shortlisted' THEN
        SELECT round_id INTO v_first_round FROM round WHERE job_id = v_job ORDER BY sequence_number ASC LIMIT 1;
        UPDATE application SET status = 'Shortlisted', current_round_id = v_first_round WHERE application_id = p_app_id;
    ELSEIF p_new_status = 'In_Round' THEN
        UPDATE application SET
            status = 'In_Round',
            current_round_id = IFNULL(
                p_round_id,
                (SELECT r.round_id FROM round r WHERE r.job_id = v_job ORDER BY r.sequence_number ASC LIMIT 1)
            )
        WHERE application_id = p_app_id;
    ELSE
        UPDATE application SET status = p_new_status, current_round_id = NULL WHERE application_id = p_app_id;
    END IF;
END$$

-- 3. Trigger: trg_BeforeApplicationInsert (Deadline check)
DROP TRIGGER IF EXISTS trg_BeforeApplicationInsert$$
CREATE TRIGGER trg_BeforeApplicationInsert
BEFORE INSERT ON application
FOR EACH ROW
BEGIN
    DECLARE v_deadline DATE;
    SELECT application_deadline INTO v_deadline
    FROM job WHERE job_id = NEW.job_id;
    
    IF CURDATE() > v_deadline THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application failed: The deadline for this job has passed.';
    END IF;
END$$

-- 4. Procedure: BulkAutoShortlist (competitive top-N by CGPA / backlogs)
DROP PROCEDURE IF EXISTS BulkAutoShortlist$$
CREATE PROCEDURE BulkAutoShortlist(IN p_job_id INT, IN p_limit INT)
BEGIN
    IF p_limit IS NULL OR p_limit < 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shortlist limit must be a positive integer.';
    END IF;

    DROP TEMPORARY TABLE IF EXISTS tmp_shortlist_rank;
    CREATE TEMPORARY TABLE tmp_shortlist_rank AS
    SELECT a.application_id,
           ROW_NUMBER() OVER (
             ORDER BY s.cgpa DESC, s.active_backlogs ASC, a.applied_at ASC, a.application_id ASC
           ) AS rn
    FROM application a
    JOIN student s ON s.student_id = a.student_id
    WHERE a.job_id = p_job_id AND a.status = 'Applied';

    UPDATE application a
    INNER JOIN tmp_shortlist_rank t ON a.application_id = t.application_id AND t.rn <= p_limit
    LEFT JOIN (
        SELECT job_id, MIN(round_id) AS first_rid FROM round GROUP BY job_id
    ) fr ON fr.job_id = a.job_id
    SET a.status = 'Shortlisted', a.current_round_id = fr.first_rid;

    UPDATE application a
    INNER JOIN tmp_shortlist_rank t ON a.application_id = t.application_id AND t.rn > p_limit
    SET a.status = 'Rejected', a.current_round_id = NULL;

    DROP TEMPORARY TABLE IF EXISTS tmp_shortlist_rank;
END$$

-- 5. Trigger: trg_AfterApplicationStatusUpdate (Audit)
DROP TRIGGER IF EXISTS trg_AfterApplicationStatusUpdate$$
CREATE TRIGGER trg_AfterApplicationStatusUpdate
AFTER UPDATE ON application
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO application_audit (application_id, old_status, new_status)
        VALUES (NEW.application_id, OLD.status, NEW.status);
    END IF;
END$$

-- 6. Trigger: trg_BeforeStudentDelete (Protect Placed)
DROP TRIGGER IF EXISTS trg_BeforeStudentDelete$$
CREATE TRIGGER trg_BeforeStudentDelete
BEFORE DELETE ON student
FOR EACH ROW
BEGIN
    IF OLD.placement_status = 'Placed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete a student who has been placed.';
    END IF;
END$$

-- 7. Trigger: trg_BeforeUserInsert_EmailDomain (Only @snu.edu.in)
DROP TRIGGER IF EXISTS trg_BeforeUserInsert_EmailDomain$$
CREATE TRIGGER trg_BeforeUserInsert_EmailDomain
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF NEW.email NOT LIKE '%@snu.edu.in' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only @snu.edu.in email addresses are allowed.';
    END IF;
END$$

-- 8. Trigger: trg_BeforeUserUpdate_EmailDomain (Prevent changing to non-SNU)
DROP TRIGGER IF EXISTS trg_BeforeUserUpdate_EmailDomain$$
CREATE TRIGGER trg_BeforeUserUpdate_EmailDomain
BEFORE UPDATE ON user
FOR EACH ROW
BEGIN
    IF NEW.email NOT LIKE '%@snu.edu.in' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only @snu.edu.in email addresses are allowed.';
    END IF;
END$$

-- 9. Procedure: GetPlacementStatsByBranch (Cursor)
DROP PROCEDURE IF EXISTS GetPlacementStatsByBranch$$
CREATE PROCEDURE GetPlacementStatsByBranch()
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_branch VARCHAR(50);
    DECLARE v_total INT;
    DECLARE v_placed INT;
    DECLARE branch_cursor CURSOR FOR SELECT DISTINCT branch FROM student;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_stats (
        branch VARCHAR(50), total_students INT, placed INT, placement_pct DECIMAL(5,2)
    );
    TRUNCATE TABLE temp_stats;
    
    OPEN branch_cursor;
    stats_loop: LOOP
        FETCH branch_cursor INTO v_branch;
        IF v_done THEN LEAVE stats_loop; END IF;
        
        SELECT COUNT(*), COALESCE(SUM(CASE WHEN placement_status='Placed' THEN 1 ELSE 0 END), 0)
        INTO v_total, v_placed
        FROM student WHERE branch = v_branch;
        
        IF v_total > 0 THEN
            INSERT INTO temp_stats VALUES (v_branch, v_total, v_placed, ROUND(v_placed * 100.0 / v_total, 2));
        END IF;
    END LOOP;
    CLOSE branch_cursor;
    
    SELECT * FROM temp_stats ORDER BY placement_pct DESC;
END$$

-- 10. Procedure: GetStudentApplicationSummary
DROP PROCEDURE IF EXISTS GetStudentApplicationSummary$$
CREATE PROCEDURE GetStudentApplicationSummary(IN p_student_id INT)
BEGIN
    SELECT 
        a.application_id, c.name AS company_name, c.logo_url, j.role_name, 
        a.status AS app_status, a.applied_at
    FROM application a
    JOIN job j ON a.job_id = j.job_id
    JOIN company c ON j.company_id = c.company_id
    WHERE a.student_id = p_student_id
    ORDER BY a.applied_at DESC;
END$$

-- 11. Procedure: CreateJobWithBranches (Transaction)
DROP PROCEDURE IF EXISTS CreateJobWithBranches$$
CREATE PROCEDURE CreateJobWithBranches(
    IN p_company_id INT, IN p_role VARCHAR(100), IN p_type ENUM('Internship','Full-Time','Part-Time'),
    IN p_ctc DECIMAL(10,2), IN p_min_cgpa DECIMAL(4,2), IN p_max_backlogs INT,
    IN p_skills TEXT, IN p_visit_date DATE, IN p_deadline DATE,
    IN p_branches TEXT
)
BEGIN
    DECLARE v_job_id INT;
    DECLARE v_branch VARCHAR(50);
    DECLARE v_remaining TEXT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Job creation failed, transaction rolled back.';
    END;
    
    START TRANSACTION;
        INSERT INTO job (company_id, role_name, job_type, ctc_or_stipend, min_cgpa, max_backlogs, required_skills, visit_date, application_deadline)
        VALUES (p_company_id, p_role, p_type, p_ctc, p_min_cgpa, p_max_backlogs, p_skills, p_visit_date, p_deadline);
        SET v_job_id = LAST_INSERT_ID();
        
        SET v_remaining = p_branches;
        WHILE LENGTH(v_remaining) > 0 DO
            SET v_branch = TRIM(SUBSTRING_INDEX(v_remaining, ',', 1));
            IF v_branch != '' THEN
                INSERT INTO job_branches (job_id, branch_name) VALUES (v_job_id, v_branch);
            END IF;
            IF LOCATE(',', v_remaining) > 0 THEN
                SET v_remaining = SUBSTRING(v_remaining, LOCATE(',', v_remaining) + 1);
            ELSE
                SET v_remaining = '';
            END IF;
        END WHILE;
    COMMIT;
    
    SELECT v_job_id AS job_id;
END$$

-- 12. Function: GetCTCStats
DROP FUNCTION IF EXISTS GetCTCStats$$
CREATE FUNCTION GetCTCStats()
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_avg_ctc DECIMAL(10,2);
    SELECT ROUND(AVG(j.ctc_or_stipend), 2) INTO v_avg_ctc
    FROM application a
    JOIN job j ON a.job_id = j.job_id
    WHERE a.status = 'Selected';
    RETURN COALESCE(v_avg_ctc, 0);
END$$

DELIMITER ;

-- 13. View: vw_eligible_students_per_job
CREATE OR REPLACE VIEW vw_eligible_students_per_job AS
SELECT s.student_id, s.name, s.branch, s.cgpa, s.active_backlogs, j.job_id, j.role_name, c.name AS company_name
FROM student s
JOIN job j ON j.min_cgpa <= s.cgpa AND j.max_backlogs >= s.active_backlogs
JOIN job_branches jb ON j.job_id = jb.job_id AND jb.branch_name = s.branch
JOIN company c ON j.company_id = c.company_id;

-- 14. View: vw_placement_overview
CREATE OR REPLACE VIEW vw_placement_overview AS
SELECT
    (SELECT COUNT(*) FROM company) AS total_companies,
    (SELECT COUNT(*) FROM job) AS total_jobs,
    (SELECT COUNT(*) FROM student) AS total_students,
    (SELECT COUNT(*) FROM student WHERE placement_status = 'Placed') AS placed_students,
    GetCTCStats() AS avg_ctc;

-- 15. View: vw_application_details
CREATE OR REPLACE VIEW vw_application_details AS
SELECT 
    a.application_id, a.status AS app_status, a.applied_at, a.updated_at,
    a.current_round_id,
    cr.round_name AS current_round_name,
    cr.sequence_number AS current_round_seq,
    s.student_id, s.roll_no, s.name AS student_name, s.branch, s.cgpa, s.active_backlogs, s.placement_status,
    j.job_id, j.role_name, j.job_type, j.ctc_or_stipend, j.min_cgpa, j.application_deadline,
    c.company_id, c.name AS company_name, c.industry, c.logo_url
FROM application a
JOIN student s ON a.student_id = s.student_id
JOIN job j ON a.job_id = j.job_id
JOIN company c ON j.company_id = c.company_id
LEFT JOIN round cr ON a.current_round_id = cr.round_id;
