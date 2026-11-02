const pool = require('../config/db');

exports.applyJob = async (req, res, next) => {
    try {
        const { job_id } = req.body;
        const student_id = req.user.student_id;
        
        // the DB handles deadline checking via Trigger trg_BeforeApplicationInsert
        const [result] = await pool.query(
            'INSERT INTO application (student_id, job_id, status) VALUES (?, ?, ?)',
            [student_id, job_id, 'Applied']
        );
        
        res.status(201).json({ success: true, application_id: result.insertId, message: 'Applied successfully' });
    } catch (err) {
        next(err);
    }
};

exports.getMyApplications = async (req, res, next) => {
    try {
        const student_id = req.user.student_id;
        
        // Using the vw_application_details view
        const [rows] = await pool.query(
            'SELECT * FROM vw_application_details WHERE student_id = ? ORDER BY applied_at DESC',
            [student_id]
        );
        
        res.status(200).json({ success: true, applications: rows });
    } catch (err) {
        next(err);
    }
};

exports.getApplicationsByJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        
        // Using the vw_application_details view
        const [rows] = await pool.query(
            'SELECT * FROM vw_application_details WHERE job_id = ? ORDER BY applied_at DESC',
            [jobId]
        );
        
        res.status(200).json({ success: true, applications: rows });
    } catch (err) {
        next(err);
    }
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, current_round_id } = req.body;
        const rid = current_round_id != null && current_round_id !== ''
            ? parseInt(current_round_id, 10)
            : null;

        await pool.query('CALL UpdateApplicationStatus(?, ?, ?)', [id, status, Number.isFinite(rid) ? rid : null]);
        
        await pool.query(
            'UPDATE application_audit SET changed_by = ? WHERE application_id = ? ORDER BY changed_at DESC LIMIT 1',
            [req.user.user_id, id]
        );
        
        res.status(200).json({ success: true, message: `Application status updated to ${status}`});
    } catch (err) {
        next(err);
    }
};

exports.getMyJobRoundProgress = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const studentId = req.user.student_id;

        const [[app]] = await pool.query(
            `SELECT a.*, cr.round_name AS current_round_name, cr.sequence_number AS current_round_seq
             FROM application a
             LEFT JOIN round cr ON a.current_round_id = cr.round_id
             WHERE a.student_id = ? AND a.job_id = ?`,
            [studentId, jobId]
        );

        if (!app) {
            return res.status(200).json({ success: true, hasApplication: false });
        }

        const [rounds] = await pool.query(
            `SELECT r.round_id, r.job_id, r.round_name, r.sequence_number,
                    rr.status AS result_status, rr.remarks
             FROM round r
             LEFT JOIN round_result rr ON rr.round_id = r.round_id AND rr.application_id = ?
             WHERE r.job_id = ?
             ORDER BY r.sequence_number ASC`,
            [app.application_id, jobId]
        );

        res.status(200).json({
            success: true,
            hasApplication: true,
            application: app,
            rounds,
        });
    } catch (err) {
        next(err);
    }
};

exports.getApplicationRounds = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [[app]] = await pool.query(
            'SELECT student_id FROM application WHERE application_id = ?',
            [id]
        );
        if (!app) {
            return res.status(404).json({ success: false, error: { message: 'Application not found' } });
        }
        if (req.user.role === 'Student' && parseInt(req.user.student_id, 10) !== parseInt(app.student_id, 10)) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }

        const [rows] = await pool.query(`
            SELECT r.*, rr.status AS result_status, rr.remarks, rr.evaluated_at
            FROM round r
            LEFT JOIN round_result rr ON r.round_id = rr.round_id AND rr.application_id = ?
            JOIN application a ON r.job_id = a.job_id
            WHERE a.application_id = ?
            ORDER BY r.sequence_number ASC
        `, [id, id]);
        
        res.status(200).json({ success: true, rounds: rows });
    } catch (err) {
        next(err);
    }
};
