const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createBooking);
router.get('/admin/all', protect, getBookings);
router.put('/admin/:id/status', protect, updateBookingStatus);

module.exports = router;
