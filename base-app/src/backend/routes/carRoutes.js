const express = require('express');
const router = express.Router();
const { getCars, getCarById, createCar, uploadCarImage, uploadMultipleImages } = require('../controllers/carController');
const { getAllCars, updateCarStatus, updateCar } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Diagnostic route
router.get('/health-check', (req, res) => res.json({ msg: 'Car routes active' }));

// Upload routes (placed early to prevent shadowing)
router.post('/upload', protect, upload.single('car_image'), uploadCarImage);
router.post('/upload-multiple', protect, upload.array('secondary_images', 10), uploadMultipleImages);

// Standard CRUD routes
router.get('/', getCars);
router.get('/admin/all', protect, getAllCars);
router.post('/', protect, createCar);
router.get('/:id', getCarById);
router.put('/:id', protect, updateCar);
router.put('/:id/status', protect, updateCarStatus);

module.exports = router;
