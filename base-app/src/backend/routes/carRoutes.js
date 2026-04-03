const express = require('express');
const router = express.Router();
const { getCars, getCarById, createCar } = require('../controllers/carController');
const { getAllCars, updateCarStatus, updateCar } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCars);
router.get('/admin/all', protect, getAllCars);
router.post('/', protect, createCar);
router.get('/:id', getCarById);
router.put('/:id', protect, updateCar);
router.put('/:id/status', protect, updateCarStatus);

module.exports = router;
