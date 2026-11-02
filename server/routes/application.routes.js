const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/', requireAuth, authorize('Student'), applicationController.applyJob);
router.get('/my', requireAuth, authorize('Student'), applicationController.getMyApplications);
router.get('/job/:jobId/my-progress', requireAuth, authorize('Student'), applicationController.getMyJobRoundProgress);

// Admin only
router.get('/job/:jobId', requireAuth, authorize('Admin'), applicationController.getApplicationsByJob);

router.get('/:id/rounds', requireAuth, applicationController.getApplicationRounds);
router.patch('/:id/status', requireAuth, authorize('Admin'), applicationController.updateApplicationStatus);

module.exports = router;
