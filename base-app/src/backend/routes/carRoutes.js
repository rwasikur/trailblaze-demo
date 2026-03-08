const express = require('express');
const router = express.Router();
const { getCars, getCarById, bookCar, rateCar, getCarRatings } = require('../controllers/carController');

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/:id/book', bookCar);
router.post('/:id/rate', rateCar);
router.get('/:id/ratings', getCarRatings);

module.exports = router;
