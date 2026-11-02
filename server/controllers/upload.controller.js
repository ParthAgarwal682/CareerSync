const pool = require('../config/db');

exports.uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'No file uploaded' }});
        }
        
        const resumeUrl = req.file.path;
        const studentId = req.user.student_id;
        
        const [result] = await pool.query(
            'UPDATE student SET resume_link = ? WHERE student_id = ?',
            [resumeUrl, studentId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Student not found' }});
        }
        
        res.status(200).json({ success: true, url: resumeUrl, message: 'Resume uploaded successfully' });
    } catch (err) {
        next(err);
    }
};

exports.uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'No file uploaded' }});
        }
        
        const imageUrl = req.file.path;
        const studentId = req.user.student_id;
        
        const [result] = await pool.query(
            'UPDATE student SET profile_picture = ? WHERE student_id = ?',
            [imageUrl, studentId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Student not found' }});
        }
        
        res.status(200).json({ success: true, url: imageUrl, message: 'Profile picture uploaded successfully' });
    } catch (err) {
        next(err);
    }
};

exports.uploadCompanyLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'No file uploaded' }});
        }
        
        const logoUrl = req.file.path;
        const companyId = req.params.companyId;
        
        const [result] = await pool.query(
            'UPDATE company SET logo_url = ? WHERE company_id = ?',
            [logoUrl, companyId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Company not found' }});
        }
        
        res.status(200).json({ success: true, url: logoUrl, message: 'Company logo uploaded successfully' });
    } catch (err) {
        next(err);
    }
};

exports.getResumeUrl = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        
        if (req.user.role === 'Student' && parseInt(req.user.student_id) !== parseInt(studentId)) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        
        const [rows] = await pool.query('SELECT resume_link FROM student WHERE student_id = ?', [studentId]);
        
        if (rows.length === 0 || !rows[0].resume_link) {
            return res.status(404).json({ success: false, error: { message: 'Resume not found' }});
        }
        
        res.status(200).json({ success: true, url: rows[0].resume_link });
    } catch (err) {
        next(err);
    }
};
