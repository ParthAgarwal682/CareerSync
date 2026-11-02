const pool = require('../config/db');
const { hashPassword, generateToken } = require('../utils/helpers');
const passport = require('passport');

// Validation helpers
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
const EMAIL_DOMAIN = '@snu.edu.in';

function validatePassword(password) {
    if (!password || password.length < 6) {
        return 'Password must be at least 6 characters long.';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one digit.';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return 'Password must contain at least one special character.';
    }
    return null;
}

function validateEmail(email) {
    if (!email || !email.endsWith(EMAIL_DOMAIN)) {
        return `Only ${EMAIL_DOMAIN} email addresses are allowed.`;
    }
    return null;
}

exports.signup = async (req, res, next) => {
    const { email, password, role, roll_no, name, branch, graduation_year, cgpa, active_backlogs } = req.body;

    // Server-side validation
    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, error: { message: emailErr } });

    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ success: false, error: { message: pwErr } });

    const finalRole = role || 'Student';

    if (finalRole === 'Student') {
        if (!roll_no || !name || !branch) {
            return res.status(400).json({ success: false, error: { message: 'Roll number, name, and branch are required.' } });
        }
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let student_id = null;

        if (finalRole === 'Student') {
            const [studentResult] = await connection.query(
                `INSERT INTO student (roll_no, name, branch, graduation_year, cgpa, active_backlogs) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [roll_no, name, branch, graduation_year, cgpa, active_backlogs || 0]
            );
            student_id = studentResult.insertId;
        }

        const hashed = await hashPassword(password);
        const [userResult] = await connection.query(
            `INSERT INTO user (email, password_hash, role, student_id) VALUES (?, ?, ?, ?)`,
            [email, hashed, finalRole, student_id]
        );

        await connection.commit();

        const user = {
            user_id: userResult.insertId,
            email,
            role: finalRole,
            student_id
        };

        const token = generateToken(user);
        res.status(201).json({ success: true, token, user });

    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        
        if (!user) {
            return res.status(401).json({ success: false, error: { message: info.message || 'Invalid credentials' } });
        }

        const token = generateToken(user);
        res.status(200).json({ 
            success: true, 
            token, 
            user: { 
                user_id: user.user_id, 
                email: user.email, 
                role: user.role, 
                student_id: user.student_id 
            } 
        });
    })(req, res, next);
};

exports.getMe = async (req, res, next) => {
    try {
        const user = req.user;
        
        if (user.role === 'Student') {
            const [rows] = await pool.query(`SELECT * FROM student WHERE student_id = ?`, [user.student_id]);
            return res.status(200).json({ success: true, user: { ...user, profile: rows[0] } });
        }
        
        res.status(200).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

// Google OAuth callback handler
exports.googleCallback = async (req, res, next) => {
    try {
        const user = req.user;
        
        if (user.needsCompletion) {
            // New user — redirect to frontend with a temp token to complete signup
            const tempToken = generateToken({ 
                email: user.email, 
                needsCompletion: true 
            });
            return res.redirect(`http://localhost:5173/auth/complete-signup?token=${tempToken}&email=${encodeURIComponent(user.email)}`);
        }
        
        // Existing user — issue full JWT and redirect to dashboard
        const token = generateToken(user);
        return res.redirect(`http://localhost:5173/auth/google/callback?token=${token}&role=${user.role}`);
    } catch (err) {
        next(err);
    }
};

// Complete Google signup (new users fill in student details)
exports.completeGoogleSignup = async (req, res, next) => {
    const { email, roll_no, name, branch, graduation_year, cgpa, active_backlogs } = req.body;
    
    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, error: { message: emailErr } });

    if (!roll_no || !name || !branch) {
        return res.status(400).json({ success: false, error: { message: 'Roll number, name, and branch are required.' } });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if user already exists (race condition guard)
        const [existing] = await connection.query('SELECT * FROM user WHERE email = ?', [email]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, error: { message: 'An account with this email already exists.' } });
        }

        const [studentResult] = await connection.query(
            `INSERT INTO student (roll_no, name, branch, graduation_year, cgpa, active_backlogs) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [roll_no, name, branch, graduation_year, cgpa, active_backlogs || 0]
        );
        const student_id = studentResult.insertId;

        // Google users don't have a password — store a placeholder that can never match bcrypt
        const [userResult] = await connection.query(
            `INSERT INTO user (email, password_hash, role, student_id) VALUES (?, ?, 'Student', ?)`,
            [email, 'GOOGLE_OAUTH_NO_PASSWORD', student_id]
        );

        await connection.commit();

        const user = {
            user_id: userResult.insertId,
            email,
            role: 'Student',
            student_id
        };

        const token = generateToken(user);
        res.status(201).json({ success: true, token, user });

    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};
