const express = require('express');
const router = express.Router();
const { authAdmin, signupAdmin, getAdminProfile, updateAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const Admin = require('../models/Admin');

router.post('/login', authAdmin);
router.post('/signup', signupAdmin);
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);

router.delete('/users/:email', async (req, res) => {
    const { email } = req.params;
    await Admin.destroy({ where: { email } });
    res.status(200).json({ message: 'deleted' });
});

module.exports = router;
