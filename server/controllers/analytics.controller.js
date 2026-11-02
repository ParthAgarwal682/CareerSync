const pool = require('../config/db');

exports.getOverview = async (req, res, next) => {
    try {
        // Uses View #12: vw_placement_overview
        const [rows] = await pool.query('SELECT * FROM vw_placement_overview');
        res.status(200).json({ success: true, overview: rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.getPlacementByBranch = async (req, res, next) => {
    try {
        // Calls Procedure #7: GetPlacementStatsByBranch (Cursor-based)
        const [rows] = await pool.query('CALL GetPlacementStatsByBranch()');
        res.status(200).json({ success: true, stats: rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.getCompanyWiseSelections = async (req, res, next) => {
    try {
        // Window Function + CTE
        const query = `
            WITH company_selections AS (
                SELECT c.name, COUNT(*) AS selections
                FROM application a
                JOIN job j ON a.job_id = j.job_id
                JOIN company c ON j.company_id = c.company_id
                WHERE a.status = 'Selected'
                GROUP BY c.company_id
            )
            SELECT name, selections, RANK() OVER (ORDER BY selections DESC) AS rank_position
            FROM company_selections
            LIMIT 10;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, stats: rows });
    } catch (err) {
        next(err);
    }
};

exports.getCtcStats = async (req, res, next) => {
    try {
        // Aggregate functions
        const query = `
            SELECT 
                ROUND(AVG(j.ctc_or_stipend), 2) AS avg_ctc,
                MAX(j.ctc_or_stipend) AS max_ctc,
                MIN(j.ctc_or_stipend) AS min_ctc
            FROM application a
            JOIN job j ON a.job_id = j.job_id
            WHERE a.status = 'Selected'
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, stats: rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.getPlacementTimeline = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                DATE_FORMAT(updated_at, '%Y-%m') AS month,
                COUNT(*) AS selections
            FROM application
            WHERE status = 'Selected'
            GROUP BY month
            ORDER BY month ASC
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, timeline: rows });
    } catch (err) {
        next(err);
    }
};
