const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const storeController = require('../controllers/storeController');
const ownerController = require('../controllers/ownerController');

// ==========================================
// PUBLIC & GENERAL AUTH ROUTES
// ==========================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/change-password', authenticate, authController.changePassword);

// ==========================================
// SYSTEM ADMINISTRATOR ROUTES
// ==========================================
router.get('/admin/stats', authenticate, authorize('admin'), adminController.getDashboardStats);
router.post('/admin/users', authenticate, authorize('admin'), adminController.addUser);
router.post('/admin/stores', authenticate, authorize('admin'), adminController.addStore);
router.get('/admin/users', authenticate, authorize('admin'), adminController.getUsers);
router.get('/admin/users/:id', authenticate, authorize('admin'), adminController.getUserDetails);
router.get('/admin/stores', authenticate, authorize('admin'), adminController.getStores);

// ==========================================
// NORMAL USER / CUSTOMER ROUTES
// ==========================================
// Get all stores (accessible by normal users and admins for listing stores)
router.get('/stores', authenticate, authorize(['normal', 'admin']), storeController.getStoresList);
// Submit or edit rating for a specific store
router.post('/stores/:id/rate', authenticate, authorize('normal'), storeController.submitRating);

// ==========================================
// STORE OWNER ROUTES
// ==========================================
router.get('/owner/dashboard', authenticate, authorize('store_owner'), ownerController.getOwnerDashboard);

module.exports = router;
