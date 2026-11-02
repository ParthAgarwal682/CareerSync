CREATE TABLE IF NOT EXISTS company (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(100),
    hr_name VARCHAR(100),
    hr_email VARCHAR(100),
    logo_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    graduation_year INT NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    active_backlogs INT DEFAULT 0,
    resume_link VARCHAR(255),
    profile_picture VARCHAR(500) DEFAULT NULL,
    placement_status ENUM('Unplaced', 'Placed') DEFAULT 'Unplaced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    job_type ENUM('Internship', 'Full-Time', 'Part-Time') DEFAULT 'Full-Time',
    ctc_or_stipend DECIMAL(10,2),
    min_cgpa DECIMAL(4,2),
    max_backlogs INT DEFAULT 0,
    required_skills TEXT,
    visit_date DATE,
    application_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    branch_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (job_id) REFERENCES job(job_id) ON DELETE CASCADE
);

-- Rounds defined before applications so application can reference current_round_id
CREATE TABLE IF NOT EXISTS round (
    round_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    round_name VARCHAR(100) NOT NULL,
    sequence_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (job_id, sequence_number),
    FOREIGN KEY (job_id) REFERENCES job(job_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS application (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    status ENUM('Applied', 'Shortlisted', 'In_Round', 'Selected', 'Rejected') DEFAULT 'Applied',
    current_round_id INT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (student_id, job_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job(job_id) ON DELETE CASCADE,
    FOREIGN KEY (current_round_id) REFERENCES round(round_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS round_result (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    round_id INT NOT NULL,
    application_id INT NOT NULL,
    status ENUM('Pending', 'Cleared', 'Failed') DEFAULT 'Pending',
    remarks TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (round_id, application_id),
    FOREIGN KEY (round_id) REFERENCES round(round_id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES application(application_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Student') NOT NULL,
    student_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS application_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    old_status VARCHAR(32),
    new_status VARCHAR(32) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by INT,
    FOREIGN KEY (application_id) REFERENCES application(application_id) ON DELETE CASCADE
);
