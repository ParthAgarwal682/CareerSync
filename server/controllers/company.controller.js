const pool = require('../config/db');

exports.getAllCompanies = async (req, res, next) => {
    try {
        const { search, limit = 100, offset = 0 } = req.query;
        let query = 'SELECT *, (SELECT COUNT(*) FROM job WHERE company_id = company.company_id) AS jobs_count FROM company';
        const params = [];
        
        if (search) {
            query += ' WHERE name LIKE ? OR industry LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        res.status(200).json({ success: true, companies: rows });
    } catch (err) {
        next(err);
    }
};

exports.getCompanyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [companyRows] = await pool.query('SELECT * FROM company WHERE company_id = ?', [id]);
        
        if (companyRows.length === 0) {
            return res.status(404).json({ success: false, error: { message: 'Company not found' }});
        }
        
        const [jobRows] = await pool.query('SELECT * FROM job WHERE company_id = ? ORDER BY created_at DESC', [id]);
        
        const company = companyRows[0];
        company.jobs = jobRows;
        
        res.status(200).json({ success: true, company });
    } catch (err) {
        next(err);
    }
};

exports.createCompany = async (req, res, next) => {
    try {
        const { name, industry, location, hr_name, hr_email, logo_url } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO company (name, industry, location, hr_name, hr_email, logo_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, industry, location, hr_name, hr_email, logo_url || null]
        );
        
        res.status(201).json({ success: true, company_id: result.insertId });
    } catch (err) {
        next(err);
    }
};

exports.updateCompany = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, industry, location, hr_name, hr_email, logo_url } = req.body;
        
        const [result] = await pool.query(
            'UPDATE company SET name = ?, industry = ?, location = ?, hr_name = ?, hr_email = ?, logo_url = ? WHERE company_id = ?',
            [name, industry, location, hr_name, hr_email, logo_url || null, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Company not found' }});
        }
        
        res.status(200).json({ success: true, message: 'Company updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteCompany = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM company WHERE company_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Company not found' }});
        }
        
        res.status(200).json({ success: true, message: 'Company deleted successfully' });
    } catch (err) {
        next(err);
    }
};
