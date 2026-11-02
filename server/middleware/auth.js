const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        return next();
    }
    return res.status(403).json({ success: false, error: { message: 'Forbidden: Admin access required.' } });
};

module.exports = { requireAuth, requireAdmin };
