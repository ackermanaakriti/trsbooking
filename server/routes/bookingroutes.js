const express = require('express');
const { getBookings, addBooking } = require('../controllers/bookingcontroller');
const authMiddleware = require('../middlewares/authmiddleware');
const router = express.Router();

router.get('/', authMiddleware, getBookings);
router.post('/', authMiddleware, addBooking);

module.exports = router;
