const pool = require('../config/db');

exports.getRoundsByJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const [rows] = await pool.query('SELECT * FROM round WHERE job_id = ? ORDER BY sequence_number ASC', [jobId]);
        res.status(200).json({ success: true, rounds: rows });
    } catch (err) {
        next(err);
    }
};

exports.createRound = async (req, res, next) => {
    try {
        const { job_id, round_name, sequence_number } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO round (job_id, round_name, sequence_number) VALUES (?, ?, ?)',
            [job_id, round_name, sequence_number]
        );
        
        res.status(201).json({ success: true, round_id: result.insertId });
    } catch (err) {
        next(err);
    }
};

exports.updateRound = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { round_name, sequence_number } = req.body;
        
        const [result] = await pool.query(
            'UPDATE round SET round_name = ?, sequence_number = ? WHERE round_id = ?',
            [round_name, sequence_number, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Round not found' }});
        }
        res.status(200).json({ success: true, message: 'Round updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteRound = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM round WHERE round_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: { message: 'Round not found' }});
        }
        res.status(200).json({ success: true, message: 'Round deleted successfully' });
    } catch (err) {
        next(err);
    }
};

exports.submitResult = async (req, res, next) => {
    const { roundId } = req.params;
    const { application_id, status, remarks } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            `INSERT INTO round_result (round_id, application_id, status, remarks) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
            [roundId, application_id, status, remarks]
        );

        const [[roundRow]] = await connection.query('SELECT * FROM round WHERE round_id = ?', [roundId]);
        if (!roundRow) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: { message: 'Round not found' } });
        }

        const [allRounds] = await connection.query(
            'SELECT * FROM round WHERE job_id = ? ORDER BY sequence_number ASC',
            [roundRow.job_id]
        );
        const idx = allRounds.findIndex((r) => r.round_id === Number(roundId));

        if (status === 'Failed') {
            await connection.query(
                'UPDATE application SET status = ?, current_round_id = NULL WHERE application_id = ?',
                ['Rejected', application_id]
            );
        } else if (status === 'Cleared') {
            const nextRound = allRounds[idx + 1];
            if (nextRound) {
                await connection.query(
                    'UPDATE application SET status = ?, current_round_id = ? WHERE application_id = ?',
                    ['In_Round', nextRound.round_id, application_id]
                );
            } else {
                await connection.query(
                    'UPDATE application SET status = ?, current_round_id = NULL WHERE application_id = ?',
                    ['Selected', application_id]
                );
                await connection.query(
                    `UPDATE student s
                     JOIN application a ON s.student_id = a.student_id
                     SET s.placement_status = 'Placed'
                     WHERE a.application_id = ?`,
                    [application_id]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ success: true, message: 'Result submitted successfully' });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};

exports.getResultsByRound = async (req, res, next) => {
    try {
        const { roundId } = req.params;
        const [rows] = await pool.query(`
            SELECT rr.*, a.status AS app_status, s.name AS student_name, s.roll_no 
            FROM round_result rr
            JOIN application a ON rr.application_id = a.application_id
            JOIN student s ON a.student_id = s.student_id
            WHERE rr.round_id = ?
        `, [roundId]);
        
        res.status(200).json({ success: true, results: rows });
    } catch (err) {
        next(err);
    }
};
