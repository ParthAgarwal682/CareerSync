const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', requireAuth, jobController.getAllJobs);
router.get('/:id', requireAuth, jobController.getJobById);
router.get('/:id/eligibility/:studentId', requireAuth, jobController.checkEligibility);

// Admin only
router.post('/', requireAuth, authorize('Admin'), jobController.createJob);
router.put('/:id', requireAuth, authorize('Admin'), jobController.updateJob);
router.delete('/:id', requireAuth, authorize('Admin'), jobController.deleteJob);
router.post('/:id/shortlist', requireAuth, authorize('Admin'), jobController.autoShortlist);

module.exports = router;
