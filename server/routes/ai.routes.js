const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 24,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many AI requests. Please wait a minute and try again.' } },
});

router.post('/chat', requireAuth, aiLimiter, aiController.chat);

module.exports = router;
