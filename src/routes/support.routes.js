const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

// Optional middleware to get user if present but not required
const optionalAuth = (req, res, next) => {
  authenticate(req, res, (err) => {
    // We ignore errors to allow anonymous submissions
    next();
  });
};

// Public endpoint for contacting support (can also be authenticated)
router.post('/', optionalAuth, supportController.createMessage);

// Authenticated/Admin endpoints
router.get('/', authenticate, supportController.getAllMessages);
router.post('/:id/reply', authenticate, supportController.addReply);

// Admin only endpoints
router.put('/:id', authenticate, authorize('admin'), supportController.updateStatus);

module.exports = router;
