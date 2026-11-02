const pool = require('../config/db');

exports.getAllJobs = async (req, res, next) => {
    try {
        const { branch, type, min_ctc, active } = req.query;
        let query = `
            SELECT j.*, c.name AS company_name, c.logo_url,
            (SELECT COUNT(*) FROM application WHERE job_id = j.job_id) AS applicants_count
            FROM job j
            JOIN company c ON j.company_id = c.company_id
        `;
        const params = [];
        const conditions = [];

        if (branch) {
            query += ` JOIN job_branches jb ON j.job_id = jb.job_id`;
            conditions.push(`jb.branch_name = ?`);
            params.push(branch);
        }
        if (type) {
            conditions.push(`j.job_type = ?`);
            params.push(type);
        }
        if (min_ctc) {
            conditions.push(`j.ctc_or_stipend >= ?`);
            params.push(min_ctc);
        }
        if (active === 'true') {
            conditions.push(`j.application_deadline >= CURDATE()`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY j.created_at DESC';

        const [rows] = await pool.query(query, params);
        res.status(200).json({ success: true, jobs: rows });
    } catch (err) {
        next(err);
    }
};

exports.getJobById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [jobRows] = await pool.query(`
            SELECT j.*, c.name AS company_name, c.industry, c.logo_url
            FROM job j JOIN company c ON j.company_id = c.company_id 
            WHERE j.job_id = ?`, [id]);
            
        if (jobRows.length === 0) {
            return res.status(404).json({ success: false, error: { message: 'Job not found' }});
        }
        
        const [branchRows] = await pool.query('SELECT branch_name FROM job_branches WHERE job_id = ?', [id]);
        const branches = branchRows.map(b => b.branch_name);
        
        const [roundRows] = await pool.query('SELECT * FROM round WHERE job_id = ? ORDER BY sequence_number ASC', [id]);
        
        const job = jobRows[0];
        job.branches = branches;
        job.rounds = roundRows;
        
        res.status(200).json({ success: true, job });
    } catch (err) {
        next(err);
    }
};

exports.createJob = async (req, res, next) => {
    try {
        const { company_id, role_name, job_type, ctc_or_stipend, min_cgpa, max_backlogs, required_skills, visit_date, application_deadline, branches } = req.body;
        
        // branches should be array or comma separated string. Assuming array from frontend.
        const branchesStr = Array.isArray(branches) ? branches.join(',') : branches;

        // Call Procedure CreateJobWithBranches (which has a Transaction inside)
        const [result] = await pool.query(
            'CALL CreateJobWithBranches(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [company_id, role_name, job_type, ctc_or_stipend, min_cgpa, max_backlogs, required_skills, visit_date, application_deadline, branchesStr]
        );
        
        // result[0][0] returns the selected job_id from procedure
        res.status(201).json({ success: true, job_id: result[0][0].job_id, message: 'Job created successfully' });
    } catch (err) {
        next(err);
    }
};

exports.updateJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role_name, job_type, ctc_or_stipend, min_cgpa, max_backlogs, required_skills, visit_date, application_deadline, branches } = req.body;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [updateResult] = await connection.query(
                `UPDATE job SET role_name=?, job_type=?, ctc_or_stipend=?, min_cgpa=?, max_backlogs=?, required_skills=?, visit_date=?, application_deadline=? WHERE job_id=?`,
                [role_name, job_type, ctc_or_stipend, min_cgpa, max_backlogs, required_skills, visit_date, application_deadline, id]
            );

            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, error: { message: 'Job not found' }});
            }

            if (branches && Array.isArray(branches)) {
                await connection.query('DELETE FROM job_branches WHERE job_id = ?', [id]);
                for (const branch of branches) {
                    await connection.query('INSERT INTO job_branches (job_id, branch_name) VALUES (?, ?)', [id, branch]);
                }
            }

            await connection.commit();
            res.status(200).json({ success: true, message: 'Job updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        next(err);
    }
};

exports.deleteJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM job WHERE job_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Job not found' }});
        }
        
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (err) {
        next(err);
    }
};

exports.checkEligibility = async (req, res, next) => {
    try {
        const { id, studentId } = req.params;
        
        if (req.user.role === 'Student' && req.user.student_id != studentId) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' }});
        }
        
        // Use CheckEligibility function
        const [rows] = await pool.query('SELECT CheckEligibility(?, ?) AS eligibility', [studentId, id]);
        res.status(200).json({ success: true, status: rows[0].eligibility });
    } catch (err) {
        next(err);
    }
};

exports.autoShortlist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const raw = req.body?.limit ?? req.query?.limit;
        const limit = parseInt(raw, 10);
        if (!Number.isFinite(limit) || limit < 1) {
            return res.status(400).json({
                success: false,
                error: { message: 'Body field "limit" is required and must be a positive integer (top N applicants to shortlist).' },
            });
        }

        await pool.query('CALL BulkAutoShortlist(?, ?)', [id, limit]);

        res.status(200).json({
            success: true,
            message: `Shortlisted up to ${limit} applicant(s) by CGPA (then lowest backlogs, then earliest apply). Remaining Applied candidates were rejected.`,
        });
    } catch (err) {
        next(err);
    }
};
