const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get current user profile
router.get('/me', auth, userController.getCurrentUser);

// Get all users (Admin and CRM Manager only)
router.get('/', auth, roleCheck('Admin', 'CRM Manager'), userController.getAllUsers);

// Get team members for assignment (all authenticated users)
router.get('/team-members', auth, userController.getTeamMembers);

// Get single user
router.get('/:id', auth, roleCheck('Admin', 'CRM Manager'), userController.getUser);

// Update user (Admin only)
router.put('/:id', auth, roleCheck('Admin'), userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', auth, roleCheck('Admin'), userController.deleteUser);

module.exports = router;