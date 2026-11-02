const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db');
require('dotenv').config();

// Local Strategy for Login
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        if (rows.length === 0) {
            return done(null, false, { message: 'Invalid credentials' });
        }
        
        const user = rows[0];
        
        // Google OAuth users can't login with password
        if (user.password_hash === 'GOOGLE_OAUTH_NO_PASSWORD') {
            return done(null, false, { message: 'This account uses Google Sign-In. Please login with Google.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
        }
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// JWT Strategy for protected routes
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'placement_cell_super_secret_jwt_key_2026'
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const [rows] = await pool.query('SELECT user_id, email, role, student_id FROM user WHERE user_id = ?', [jwtPayload.user_id]);
        
        if (rows.length > 0) {
            return done(null, rows[0]);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            
            // Restrict to @snu.edu.in domain
            if (!email.endsWith('@snu.edu.in')) {
                return done(null, false, { message: 'Only @snu.edu.in email addresses are allowed.' });
            }
            
            // Check if user already exists
            const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
            
            if (rows.length > 0) {
                // Existing user — return them
                return done(null, rows[0]);
            }
            
            // New user — flag for profile completion
            return done(null, { email, needsCompletion: true });
        } catch (err) {
            return done(err);
        }
    }));
}

module.exports = passport;
