const express = require('express');
const router = express.Router();
const { getSales } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/admin/all', protect, getSales);

module.exports = router;
