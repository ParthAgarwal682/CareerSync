const express = require('express');
const router = express.Router();
const roundController = require('../controllers/round.controller');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/job/:jobId', requireAuth, roundController.getRoundsByJob);

// Admin only
router.post('/', requireAuth, authorize('Admin'), roundController.createRound);
router.put('/:id', requireAuth, authorize('Admin'), roundController.updateRound);
router.delete('/:id', requireAuth, authorize('Admin'), roundController.deleteRound);
router.post('/:roundId/results', requireAuth, authorize('Admin'), roundController.submitResult);
router.get('/:roundId/results', requireAuth, authorize('Admin'), roundController.getResultsByRound);

module.exports = router;
