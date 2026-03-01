const express = require('express');
const router = express.Router();
const { authAdmin, signupAdmin } = require('../controllers/authController');
const { createCar } = require('../controllers/carController');
const { getDashboardStats, getAllCars, deleteCar, updateCarStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signupAdmin);
router.post('/login', authAdmin);
router.post('/add-car', protect, createCar);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/cars', protect, getAllCars);
router.delete('/cars/:id', protect, deleteCar);
router.put('/cars/:id/status', protect, updateCarStatus);

module.exports = router;
