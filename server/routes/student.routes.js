const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', requireAuth, authorize('Admin'), studentController.getAllStudents);
router.get('/:id', requireAuth, studentController.getStudentById);
router.put('/:id', requireAuth, studentController.updateStudent);
router.delete('/:id', requireAuth, authorize('Admin'), studentController.deleteStudent);
router.get('/:id/alerts', requireAuth, studentController.getAlerts);

module.exports = router;
