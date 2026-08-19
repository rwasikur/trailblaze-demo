const express = require('express');
const router = express.Router();
const { saveEmiQuote } = require('../controllers/emiController');

// Public endpoint — no auth required so any user can save their EMI quote
// against a car listing from the car detail / EMI calculator page.
router.post('/save-quote', saveEmiQuote);

module.exports = router;
