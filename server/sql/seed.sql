-- ============================================
-- PLACEMENT CELL DB: FULL RESET & SEED
-- Run this script to wipe and re-populate all tables
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE application_audit;
TRUNCATE TABLE round_result;
TRUNCATE TABLE application;
TRUNCATE TABLE round;
TRUNCATE TABLE job_branches;
TRUNCATE TABLE job;
TRUNCATE TABLE user;
TRUNCATE TABLE student;
TRUNCATE TABLE company;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- COMPANIES (8)
-- ============================================
INSERT INTO company (company_id, name, industry, location, hr_name, hr_email, logo_url) VALUES
(1, 'Google', 'Technology', 'Bangalore', 'Sundar P.', 'hr@google.com', 'https://t3.ftcdn.net/jpg/03/99/98/60/360_F_399986042_9iSLYUNyDv8npaKP31xsIpDVFjfqGLDF.jpg'),
(2, 'Adobe', 'Software', 'Noida', 'Shantanu N.', 'careers@adobe.com', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6IUz73ShVx5Sa5_joQIhGlQkLyJKCN8sv4A&s'),
(3, 'Microsoft', 'Technology', 'Hyderabad', 'Satya N.', 'careers@microsoft.com', 'https://i.pinimg.com/736x/9c/b0/bc/9cb0bc7cab743ffccd22c07719ec9ba3.jpg'),
(4, 'Amazon', 'E-commerce', 'Bangalore', 'Andy J.', 'jobs@amazon.com', 'https://1000logos.net/wp-content/uploads/2016/10/Amazon-logo-meaning.jpg'),
(5, 'Goldman Sachs', 'Finance', 'Bangalore', 'David S.', 'careers@gs.com', 'https://crystalpng.com/wp-content/uploads/2025/05/Goldman-Sachs-Logo.png'),
(6, 'TCS', 'IT Services', 'Mumbai', 'Natarajan C.', 'recruitment@tcs.com', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4xCg02XFwPFNnYxlm1a1WT2q5PpQQ-lr0Kg&s'),
(7, 'Flipkart', 'E-commerce', 'Bangalore', 'Kalyan K.', 'hr@flipkart.com', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIygUTsIdSAR0MwbnUyNloj8ZCCWVZylTBBQ&s'),
(8, 'Infosys', 'IT Services', 'Pune', 'Salil P.', 'recruit@infosys.com', 'https://static.vecteezy.com/system/resources/previews/020/336/451/non_2x/infosys-logo-infosys-icon-free-free-vector.jpg');

-- ============================================
-- STUDENTS (15) — across CSE, ECE, ME, MATH, CIVIL
-- ============================================
INSERT INTO student (student_id, roll_no, name, branch, graduation_year, cgpa, active_backlogs, placement_status, profile_picture) VALUES
(1,  '2241011001', 'Parth Agarwal',   'CSE',   2026, 9.20, 0, 'Placed',   NULL),
(2,  '2241011002', 'Aditi Sharma',     'CSE',   2026, 8.50, 0, 'Placed',   NULL),
(3,  '2241011003', 'Neha Gupta',       'CSE',   2026, 9.50, 0, 'Placed',   NULL),
(4,  '2241011004', 'Sneha Kapoor',     'CSE',   2026, 8.20, 0, 'Unplaced', NULL),
(5,  '2242011001', 'Rahul Verma',      'ECE',   2026, 7.80, 1, 'Unplaced', NULL),
(6,  '2242011002', 'Rohan Das',        'ECE',   2026, 7.10, 0, 'Unplaced', NULL),
(7,  '2243011001', 'Priya Singh',      'ME',    2026, 8.90, 0, 'Placed',   NULL),
(8,  '2243011002', 'Vikram Patel',     'ME',    2026, 6.50, 2, 'Unplaced', NULL),
(9,  '2244011001', 'Ankit Joshi',      'MATH',  2026, 8.00, 0, 'Unplaced', NULL),
(10, '2244011002', 'Meera Reddy',      'MATH',  2026, 9.10, 0, 'Placed',   NULL),
(11, '2245011001', 'Arjun Nair',       'CIVIL', 2026, 7.50, 0, 'Unplaced', NULL),
(12, '2245011002', 'Kavya Menon',      'CIVIL', 2026, 8.30, 0, 'Unplaced', NULL),
(13, '2241011005', 'Ravi Kumar',       'CSE',   2027, 8.80, 0, 'Unplaced', NULL),
(14, '2242011003', 'Shreya Iyer',      'ECE',   2027, 9.00, 0, 'Unplaced', NULL),
(15, '2243011003', 'Deepak Choudhary', 'ME',    2027, 7.20, 1, 'Unplaced', NULL);

-- ============================================
-- USERS (17) — 2 admins + 15 students
-- Password for ALL accounts: admin123
-- bcrypt hash of 'admin123': $2a$12$LJ0cRMb/xqQ7N6E3vkVvxuYx8GkZm8KZJX5bnMcU.4Y3L9FkGOQq
-- ============================================
INSERT INTO user (email, password_hash, role, student_id) VALUES
('admin@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Admin',   NULL),
('cdc.head@snu.edu.in',        '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Admin',   NULL),
('pa001@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 1),
('as002@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 2),
('ng003@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 3),
('sk004@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 4),
('rv005@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 5),
('rd006@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 6),
('ps007@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 7),
('vp008@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 8),
('aj009@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 9),
('mr010@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 10),
('an011@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 11),
('km012@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 12),
('rk013@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 13),
('si014@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 14),
('dc015@snu.edu.in',           '$2b$12$Y196..xcriduSmKQ3OgWM.k8BsvrBhWTaWsCyF0jvSQDuH7ctCKoy', 'Student', 15);

-- ============================================
-- JOBS (10) — Mix of full-time & internship, past and future deadlines
-- ============================================
INSERT INTO job (job_id, company_id, role_name, job_type, ctc_or_stipend, min_cgpa, max_backlogs, required_skills, visit_date, application_deadline) VALUES
(1,  1, 'Software Engineer',         'Full-Time',  3500000, 8.50, 0, 'C++, Java, System Design',             '2026-08-15', '2026-12-01'),
(2,  2, 'Member Technical Staff',    'Full-Time',  2800000, 8.00, 0, 'Java, Spring Boot, REST APIs',         '2026-08-20', '2026-12-01'),
(3,  3, 'SDE Intern',                'Internship',  150000, 7.50, 1, 'Python, DSA, Git',                     '2026-09-01', '2026-12-01'),
(4,  4, 'SDE-1',                     'Full-Time',  3200000, 8.00, 0, 'Java, AWS, Distributed Systems',       '2026-09-10', '2026-12-01'),
(5,  5, 'Quant Analyst',             'Full-Time',  4000000, 9.00, 0, 'Statistics, Python, Linear Algebra',   '2026-08-25', '2026-12-01'),
(6,  6, 'Ninja Developer',           'Full-Time',   750000, 6.50, 2, 'Any language, aptitude',               '2026-09-15', '2026-12-01'),
(7,  7, 'Product Engineering Intern','Internship',  100000, 7.00, 1, 'React, Node.js',                       '2026-10-01', '2026-12-01'),
(8,  8, 'Systems Engineer',          'Full-Time',   650000, 6.00, 3, 'Communication, aptitude',              '2026-10-15', '2026-12-01'),
(9,  1, 'ML Engineer',               'Full-Time',  4500000, 9.00, 0, 'PyTorch, TensorFlow, ML, Stats',       '2026-11-01', '2026-12-01'),
(10, 3, 'Data Analyst Intern',       'Internship',  120000, 7.00, 1, 'SQL, Excel, Python, Tableau',          '2026-11-15', '2026-12-01');

-- ============================================
-- JOB_BRANCHES
-- ============================================
INSERT INTO job_branches (job_id, branch_name) VALUES
-- Google SDE: CSE, ECE
(1, 'CSE'), (1, 'ECE'),
-- Adobe MTS: CSE, ECE, ME
(2, 'CSE'), (2, 'ECE'), (2, 'ME'),
-- Microsoft SDE Intern: CSE, ECE, MATH
(3, 'CSE'), (3, 'ECE'), (3, 'MATH'),
-- Amazon SDE-1: CSE, ECE
(4, 'CSE'), (4, 'ECE'),
-- Goldman Sachs Quant: CSE, MATH
(5, 'CSE'), (5, 'MATH'),
-- TCS Ninja: CSE, ECE, ME, CIVIL, MATH
(6, 'CSE'), (6, 'ECE'), (6, 'ME'), (6, 'CIVIL'), (6, 'MATH'),
-- Flipkart Intern: CSE, ECE
(7, 'CSE'), (7, 'ECE'),
-- Infosys Systems: CSE, ECE, ME, CIVIL, MATH
(8, 'CSE'), (8, 'ECE'), (8, 'ME'), (8, 'CIVIL'), (8, 'MATH'),
-- Google ML: CSE, MATH
(9, 'CSE'), (9, 'MATH'),
-- Microsoft Data: CSE, ECE, MATH
(10, 'CSE'), (10, 'ECE'), (10, 'MATH');

-- ============================================
-- ROUNDS (2-3 per major job)
-- ============================================
INSERT INTO round (round_id, job_id, round_name, sequence_number) VALUES
-- Google SDE
(1,  1, 'Online Assessment',    1),
(2,  1, 'Technical Interview',  2),
(3,  1, 'HR Interview',         3),
-- Adobe MTS
(4,  2, 'Coding Test',          1),
(5,  2, 'Technical Interview',  2),
(6,  2, 'HR Round',             3),
-- Microsoft Intern
(7,  3, 'Online Test',          1),
(8,  3, 'Technical Interview',  2),
-- Amazon SDE-1
(9,  4, 'Online Assessment',    1),
(10, 4, 'Loop Interview 1',    2),
(11, 4, 'Loop Interview 2',    3),
-- Goldman Quant
(12, 5, 'Aptitude Test',        1),
(13, 5, 'Quant Interview',      2),
-- TCS Ninja
(14, 6, 'TCS NQT',              1),
(15, 6, 'HR Interview',         2),
-- Flipkart Intern
(16, 7, 'Coding Challenge',     1),
(17, 7, 'Technical Interview',  2),
-- Infosys Systems (job 8)
(18, 8, 'Aptitude Screening',   1),
(19, 8, 'Technical Interview',  2),
-- Google ML (job 9)
(20, 9, 'ML Online Assessment', 1),
(21, 9, 'ML Panel Interview',   2),
-- Microsoft Data Analyst Intern (job 10)
(22, 10, 'Online Assessment',   1),
(23, 10, 'Data Case Discussion', 2),
(24, 10, 'HR Round',            3);

-- ============================================
-- APPLICATIONS (35 across students & jobs)
-- NOTE: We disable the deadline trigger temporarily since we need to insert historical data
-- ============================================

-- Temporarily drop the deadline trigger so we can seed past applications
DROP TRIGGER IF EXISTS trg_BeforeApplicationInsert;

INSERT INTO application (application_id, student_id, job_id, status, current_round_id, applied_at) VALUES
-- Google SDE (job 1): 5 applicants — round ids 1,2,3
(1,  1, 1, 'Selected',     NULL, '2026-07-20 10:00:00'),
(2,  2, 1, 'In_Round',     2,    '2026-07-21 11:00:00'),
(3,  3, 1, 'Selected',     NULL, '2026-07-22 09:00:00'),
(4,  4, 1, 'Shortlisted',  1,    '2026-07-23 14:00:00'),
(5,  5, 1, 'Rejected',     NULL, '2026-07-24 08:00:00'),

-- Adobe MTS (job 2): rounds 4,5,6
(6,  2, 2, 'Selected',     NULL, '2026-07-25 10:00:00'),
(7,  4, 2, 'In_Round',     5,    '2026-07-26 10:00:00'),
(8,  7, 2, 'Shortlisted',  4,    '2026-07-27 10:00:00'),
(9,  5, 2, 'Rejected',     NULL, '2026-07-28 10:00:00'),

-- Microsoft Intern (job 3): rounds 7,8
(10, 3, 3, 'Selected',     NULL, '2026-08-01 10:00:00'),
(11, 6, 3, 'In_Round',     8,    '2026-08-02 10:00:00'),
(12, 9, 3, 'Shortlisted',  7,    '2026-08-03 10:00:00'),
(13, 14, 3,'Applied',      NULL, '2026-08-04 10:00:00'),
(14, 4, 3, 'Applied',      NULL, '2026-08-05 10:00:00'),

-- Amazon SDE-1 (job 4): rounds 9,10,11
(15, 1, 4, 'In_Round',     10,   '2026-08-10 10:00:00'),
(16, 3, 4, 'Shortlisted',  9,    '2026-08-11 10:00:00'),
(17, 2, 4, 'Applied',      NULL, '2026-08-12 10:00:00'),

-- Goldman Quant (job 5): rounds 12,13
(18, 3, 5, 'In_Round',     13,   '2026-08-01 10:00:00'),
(19, 10, 5,'Selected',     NULL, '2026-08-02 10:00:00'),
(20, 9, 5, 'Rejected',     NULL, '2026-08-03 10:00:00'),

-- TCS Ninja (job 6): rounds 14,15
(21, 8, 6, 'Shortlisted',  14,   '2026-08-15 10:00:00'),
(22, 5, 6, 'Applied',      NULL, '2026-08-16 10:00:00'),
(23, 6, 6, 'Applied',      NULL, '2026-08-17 10:00:00'),
(24, 11, 6,'Applied',      NULL, '2026-08-18 10:00:00'),
(25, 12, 6,'Applied',      NULL, '2026-08-19 10:00:00'),

-- Flipkart Intern (job 7): rounds 16,17
(26, 4, 7, 'In_Round',     17,   '2026-09-01 10:00:00'),
(27, 13, 7,'Applied',      NULL, '2026-09-02 10:00:00'),
(28, 14, 7,'Applied',      NULL, '2026-09-03 10:00:00'),

-- Infosys Systems (job 8): rounds 18,19
(29, 8, 8, 'Applied',      NULL, '2026-09-10 10:00:00'),
(30, 11, 8,'Applied',      NULL, '2026-09-11 10:00:00'),

-- Google ML (job 9): rounds 20,21
(31, 1, 9, 'Applied',      NULL, '2026-10-01 10:00:00'),
(32, 10, 9,'Applied',      NULL, '2026-10-02 10:00:00'),

-- Microsoft Data Intern (job 10): rounds 22,23,24
(33, 9, 10, 'Applied',     NULL, '2026-10-15 10:00:00'),
(34, 14,10, 'Applied',     NULL, '2026-10-16 10:00:00'),
(35, 6, 10, 'Applied',     NULL, '2026-10-17 10:00:00');

-- ============================================
-- ROUND RESULTS (for apps that progressed beyond Applied)
-- ============================================
INSERT INTO round_result (round_id, application_id, status, remarks) VALUES
-- Google SDE: Parth cleared all 3 rounds → Selected
(1, 1, 'Cleared', 'Strong DSA skills'),
(2, 1, 'Cleared', 'Excellent system design approach'),
(3, 1, 'Cleared', 'Great communication, good culture fit'),

-- Google SDE: Aditi in round 2 (OA cleared, interviewing)
(1, 2, 'Cleared', 'Good performance in OA'),

-- Google SDE: Neha cleared all 3 → Selected
(1, 3, 'Cleared', 'Perfect score in OA'),
(2, 3, 'Cleared', 'Outstanding problem solving'),
(3, 3, 'Cleared', 'Confident, articulate'),

-- Google SDE: Rahul failed OA → Rejected
(1, 5, 'Failed', 'Could not complete 2 out of 3 problems'),

-- Adobe MTS: Aditi cleared all → Selected
(4, 6, 'Cleared', 'Solved coding test efficiently'),
(5, 6, 'Cleared', 'Strong Java fundamentals'),
(6, 6, 'Cleared', 'Team player, good attitude'),

-- Adobe MTS: Sneha interviewing (cleared coding)
(4, 7, 'Cleared', 'Decent coding performance'),

-- Microsoft Intern: Neha cleared both → Selected
(7, 10, 'Cleared', 'Top scorer in online test'),
(8, 10, 'Cleared', 'Impressive Python skills'),

-- Goldman Quant: Meera cleared both → Selected
(12, 19, 'Cleared', 'Exceptional aptitude'),
(13, 19, 'Cleared', 'Strong mathematical reasoning'),

-- Goldman Quant: Ankit failed aptitude → Rejected
(12, 20, 'Failed', 'Did not meet cutoff'),

-- Adobe MTS: Priya OA pending
(4, 8, 'Pending', NULL),

-- TCS: Vikram pending
(14, 21, 'Pending', NULL);

-- ============================================
-- APPLICATION AUDIT TRAIL (status change history)
-- ============================================
INSERT INTO application_audit (application_id, old_status, new_status, changed_at) VALUES
(1, 'Applied',      'Shortlisted', '2026-07-25 10:00:00'),
(1, 'Shortlisted',  'In_Round',    '2026-08-01 10:00:00'),
(1, 'In_Round',     'Selected',    '2026-08-10 10:00:00'),
(3, 'Applied',      'Shortlisted', '2026-07-28 10:00:00'),
(3, 'Shortlisted',  'In_Round',    '2026-08-05 10:00:00'),
(3, 'In_Round',     'Selected',    '2026-08-12 10:00:00'),
(5, 'Applied',      'Shortlisted', '2026-07-30 10:00:00'),
(5, 'Shortlisted',  'Rejected',    '2026-08-02 10:00:00'),
(6, 'Applied',      'Shortlisted', '2026-08-01 10:00:00'),
(6, 'Shortlisted',  'In_Round',    '2026-08-08 10:00:00'),
(6, 'In_Round',     'Selected',    '2026-08-15 10:00:00'),
(10,'Applied',      'Shortlisted', '2026-08-10 10:00:00'),
(10,'Shortlisted',  'In_Round',    '2026-08-18 10:00:00'),
(10,'In_Round',     'Selected',    '2026-08-22 10:00:00'),
(19,'Applied',      'Shortlisted', '2026-08-08 10:00:00'),
(19,'Shortlisted',  'In_Round',    '2026-08-14 10:00:00'),
(19,'In_Round',     'Selected',    '2026-08-20 10:00:00');

-- ============================================
-- RE-CREATE the deadline trigger (was dropped for seeding)
-- ============================================
DELIMITER $$
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
DELIMITER ;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 'Seed Complete!' AS status;
SELECT COUNT(*) AS companies FROM company;
SELECT COUNT(*) AS students FROM student;
SELECT COUNT(*) AS users FROM user;
SELECT COUNT(*) AS jobs FROM job;
SELECT COUNT(*) AS applications FROM application;
SELECT COUNT(*) AS rounds FROM round;
SELECT COUNT(*) AS round_results FROM round_result;
SELECT COUNT(*) AS audit_entries FROM application_audit;
