const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

// Local auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);

// Google OAuth
router.get('/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
        return res.redirect('http://localhost:5173/login?error=google_not_configured');
    }
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=google_auth_failed' }),
    authController.googleCallback
);

// Complete Google signup (new users fill details)
router.post('/google/complete-signup', authController.completeGoogleSignup);

module.exports = router;
