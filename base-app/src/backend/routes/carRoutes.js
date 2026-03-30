const express = require('express');
const router = express.Router();
const { getCars, getCarById, bookCar, createCar } = require('../controllers/carController');
const { deleteCar, getAllCars, updateCarStatus, updateCar } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCars);
router.get('/admin/all', protect, getAllCars);
router.post('/', protect, createCar);
router.get('/:id', getCarById);
router.put('/:id', protect, updateCar);
router.delete('/:id', protect, deleteCar);
router.put('/:id/status', protect, updateCarStatus);
router.post('/:id/book', bookCar);

module.exports = router;
