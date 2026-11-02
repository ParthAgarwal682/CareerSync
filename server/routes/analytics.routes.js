const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/overview', requireAuth, authorize('Admin'), analyticsController.getOverview);
router.get('/placement-by-branch', requireAuth, authorize('Admin'), analyticsController.getPlacementByBranch);
router.get('/by-branch', requireAuth, authorize('Admin'), analyticsController.getPlacementByBranch);
router.get('/company-wise', requireAuth, authorize('Admin'), analyticsController.getCompanyWiseSelections);
router.get('/company-selections', requireAuth, authorize('Admin'), analyticsController.getCompanyWiseSelections);
router.get('/ctc-stats', requireAuth, authorize('Admin'), analyticsController.getCtcStats);
router.get('/timeline', requireAuth, authorize('Admin'), analyticsController.getPlacementTimeline);

module.exports = router;
