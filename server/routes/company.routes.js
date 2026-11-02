const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { requireAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', requireAuth, companyController.getAllCompanies);
router.get('/:id', requireAuth, companyController.getCompanyById);

// Admin only routes
router.post('/', requireAuth, authorize('Admin'), companyController.createCompany);
router.put('/:id', requireAuth, authorize('Admin'), companyController.updateCompany);
router.delete('/:id', requireAuth, authorize('Admin'), companyController.deleteCompany);

module.exports = router;
