const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, role: user.role, student_id: user.student_id },
        process.env.JWT_SECRET || 'placement_cell_super_secret_jwt_key_2026',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

module.exports = { hashPassword, generateToken };
