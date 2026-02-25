const express = require('express');
const router = express.Router();
const { authAdmin } = require('../controllers/authController');
const { createCar } = require('../controllers/carController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.post('/cars', protect, createCar);

module.exports = router;
