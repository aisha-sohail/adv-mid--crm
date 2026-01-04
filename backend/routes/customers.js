const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, customerController.createCustomer);
router.get('/', auth, customerController.getCustomers);
router.get('/stats', auth, customerController.getDashboardStats);
router.get('/:id', auth, customerController.getCustomer);
router.put('/:id', auth, customerController.updateCustomer);
router.delete('/:id', auth, roleCheck('Admin', 'CRM Manager'), customerController.deleteCustomer);

module.exports = router;