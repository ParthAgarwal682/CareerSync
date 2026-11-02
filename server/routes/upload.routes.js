const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadResume, uploadProfilePic, uploadCompanyLogo } = require('../middleware/upload');

// Resume upload (student)
router.post('/resume', requireAuth, uploadResume.single('resume'), uploadController.uploadResume);
router.get('/resume/:studentId', requireAuth, uploadController.getResumeUrl);

// Profile picture upload (student)
router.post('/profile-picture', requireAuth, uploadProfilePic.single('profile_picture'), uploadController.uploadProfilePicture);

// Company logo upload (admin only)
router.post('/company-logo/:companyId', requireAuth, requireAdmin, uploadCompanyLogo.single('logo'), uploadController.uploadCompanyLogo);

module.exports = router;
