const express = require('express');
const router = express.Router();
const {
    createOffer,
    deleteOffer,
    getActiveOffers,
    getAdminOffers,
    updateOffer,
} = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/active', getActiveOffers);
router.get('/admin/all', protect, getAdminOffers);
router.post('/', protect, createOffer);
router.put('/:id', protect, updateOffer);
router.delete('/:id', protect, deleteOffer);

module.exports = router;
