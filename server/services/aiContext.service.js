/**
 * Read-only JSON snapshots for the Gemini assistant.
 * Admin: broad aggregates + capped row lists.
 * Student: only rows for req.user.student_id plus anonymised open-job catalogue.
 */
const pool = require('../config/db');

const ADMIN_APP_LIMIT = 100;
const ADMIN_JOB_LIMIT = 60;
const ADMIN_ROUND_LIMIT = 250;
const STUDENT_OPEN_JOBS_LIMIT = 50;

async function buildAdminContext() {
  const [overviewRows] = await pool.query('SELECT * FROM vw_placement_overview');
  const [statusCounts] = await pool.query(
    'SELECT status, COUNT(*) AS count FROM application GROUP BY status ORDER BY status'
  );
  const [apps] = await pool.query(
    `SELECT application_id, app_status, applied_at, updated_at,
            student_id, student_name, roll_no, branch, cgpa, placement_status,
            job_id, role_name, company_name, current_round_id, current_round_name, current_round_seq
     FROM vw_application_details
     ORDER BY applied_at DESC
     LIMIT ?`,
    [ADMIN_APP_LIMIT]
  );
  const [jobs] = await pool.query(
    `SELECT j.job_id, j.role_name, j.job_type, j.application_deadline, j.visit_date,
            j.min_cgpa, j.max_backlogs, j.ctc_or_stipend,
            c.company_id, c.name AS company_name, c.industry,
            (SELECT COUNT(*) FROM application a WHERE a.job_id = j.job_id) AS application_count
     FROM job j
     JOIN company c ON j.company_id = c.company_id
     ORDER BY j.job_id DESC
     LIMIT ?`,
    [ADMIN_JOB_LIMIT]
  );
  const [rounds] = await pool.query(
    `SELECT r.round_id, r.job_id, r.round_name, r.sequence_number
     FROM round r
     ORDER BY r.job_id, r.sequence_number
     LIMIT ?`,
    [ADMIN_ROUND_LIMIT]
  );
  const [companies] = await pool.query(
    'SELECT company_id, name, industry FROM company ORDER BY name LIMIT 80'
  );
  const [roundResultsSummary] = await pool.query(
    `SELECT rr.status AS result_status, COUNT(*) AS count
     FROM round_result rr
     GROUP BY rr.status`
  );

  return {
    scope: 'admin_readonly_snapshot',
    generated_at: new Date().toISOString(),
    placement_overview: overviewRows[0] || null,
    application_counts_by_status: statusCounts,
    recent_applications: apps,
    jobs,
    rounds,
    companies,
    round_result_counts: roundResultsSummary,
  };
}

async function buildStudentContext(studentId) {
  if (studentId == null) {
    return {
      scope: 'student',
      error: 'No student profile linked to this account.',
      generated_at: new Date().toISOString(),
    };
  }

  const sid = parseInt(studentId, 10);
  const [[student]] = await pool.query(
    `SELECT student_id, name, roll_no, branch, cgpa, active_backlogs, placement_status
     FROM student WHERE student_id = ?`,
    [sid]
  );

  const [applications] = await pool.query(
    `SELECT *
     FROM vw_application_details
     WHERE student_id = ?
     ORDER BY applied_at DESC`,
    [sid]
  );

  const [roundProgress] = await pool.query(
    `SELECT a.application_id, a.job_id, j.role_name, c.name AS company_name,
            r.round_id, r.round_name, r.sequence_number,
            COALESCE(rr.status, 'Pending') AS round_result_status
     FROM application a
     JOIN job j ON j.job_id = a.job_id
     JOIN company c ON c.company_id = j.company_id
     JOIN round r ON r.job_id = a.job_id
     LEFT JOIN round_result rr ON rr.round_id = r.round_id AND rr.application_id = a.application_id
     WHERE a.student_id = ?
     ORDER BY a.job_id, r.sequence_number`,
    [sid]
  );

  const [openJobs] = await pool.query(
    `SELECT j.job_id, j.role_name, j.job_type, j.application_deadline, j.visit_date,
            j.min_cgpa, j.max_backlogs, j.ctc_or_stipend,
            c.name AS company_name, c.industry
     FROM job j
     JOIN company c ON j.company_id = c.company_id
     WHERE j.application_deadline IS NULL OR j.application_deadline >= CURDATE()
     ORDER BY j.application_deadline ASC
     LIMIT ?`,
    [STUDENT_OPEN_JOBS_LIMIT]
  );

  return {
    scope: 'student_self_only_plus_open_jobs',
    generated_at: new Date().toISOString(),
    student: student || null,
    my_applications: applications,
    my_applications_round_detail: roundProgress,
    open_jobs_catalogue: openJobs,
  };
}

module.exports = { buildAdminContext, buildStudentContext };
