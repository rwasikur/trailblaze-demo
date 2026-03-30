const express = require('express');
const router = express.Router();
const { authAdmin, signupAdmin, getAdminProfile, updateAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.post('/signup', signupAdmin);
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);

module.exports = router;
