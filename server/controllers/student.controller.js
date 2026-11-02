const pool = require('../config/db');

exports.getAllStudents = async (req, res, next) => {
    try {
        const { branch, status, min_cgpa } = req.query;
        let query = 'SELECT * FROM student WHERE 1=1';
        const params = [];
        
        if (branch) {
            query += ' AND branch = ?';
            params.push(branch);
        }
        if (status) {
            query += ' AND placement_status = ?';
            params.push(status);
        }
        if (min_cgpa) {
            query += ' AND cgpa >= ?';
            params.push(min_cgpa);
        }
        
        query += ' ORDER BY roll_no ASC';

        const [rows] = await pool.query(query, params);
        res.status(200).json({ success: true, students: rows });
    } catch (err) {
        next(err);
    }
};

exports.getStudentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Authorization logic check
        if (req.user.role === 'Student' && parseInt(req.user.student_id) !== parseInt(id)) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden: Cannot view other profiles' } });
        }

        const [rows] = await pool.query('SELECT * FROM student WHERE student_id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: { message: 'Student not found' }});
        }
        
        res.status(200).json({ success: true, student: rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.updateStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cgpa, active_backlogs, resume_link, profile_picture } = req.body;
        
        // Authorization check
        if (req.user.role === 'Student' && parseInt(req.user.student_id) !== parseInt(id)) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }

        let query = 'UPDATE student SET ';
        const params = [];
        const updates = [];

        if (cgpa !== undefined) { updates.push('cgpa = ?'); params.push(cgpa); }
        if (active_backlogs !== undefined) { updates.push('active_backlogs = ?'); params.push(active_backlogs); }
        if (resume_link !== undefined) { updates.push('resume_link = ?'); params.push(resume_link); }
        if (profile_picture !== undefined) { updates.push('profile_picture = ?'); params.push(profile_picture); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        query += updates.join(', ') + ' WHERE student_id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Student not found' }});
        }
        
        res.status(200).json({ success: true, message: 'Student profile updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Triggers trg_BeforeStudentDelete -> throws 45000 if status = 'Placed'
        const [result] = await pool.query('DELETE FROM student WHERE student_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Student not found' }});
        }
        
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        next(err);
    }
};

exports.getAlerts = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (req.user.role === 'Student' && parseInt(req.user.student_id) !== parseInt(id)) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        
        // Use application_audit table and join with current application to get recent alerts
        const query = `
            SELECT au.new_status, au.changed_at, j.role_name, c.name AS company_name, a.application_id
            FROM application_audit au
            JOIN application a ON au.application_id = a.application_id
            JOIN job j ON a.job_id = j.job_id
            JOIN company c ON j.company_id = c.company_id
            WHERE a.student_id = ? AND au.changed_at >= NOW() - INTERVAL 24 HOUR
            ORDER BY au.changed_at DESC LIMIT 10
        `;
        
        const [rows] = await pool.query(query, [id]);
        
        res.status(200).json({ success: true, alerts: rows });
    } catch (err) {
        next(err);
    }
};
