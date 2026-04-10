const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth.middleware');

// All dashboard routes require authentication, but not admin role
router.use(authenticate);

router.get('/stats', dashboardController.getStats);

module.exports = router;
