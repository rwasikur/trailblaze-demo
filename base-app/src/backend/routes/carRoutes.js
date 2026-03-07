const express = require('express');
const router = express.Router();
const { getCars, getCarById, bookCar } = require('../controllers/carController');

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/:id/book', bookCar);

module.exports = router;
