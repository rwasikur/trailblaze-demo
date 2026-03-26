const express = require('express');
const router = express.Router();
const { authAdmin, getAdminProfile, updateAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);

module.exports = router;
