const express = require('express');
const { login, register } = require('../controllers/authcontroller');  // Ensure correct path
const { authMiddleware } = require('../middlewares/authmiddleware');
const roleMiddleware = require('../middlewares/rolemiddleware');
const { getRooms, addRoom } = require('../controllers/roomcontroller');
const { getBookings, addBooking } = require('../controllers/bookingcontroller');

const router = express.Router();

router.post('/login', login);  // Correctly passing the function
router.post('/register', register);  // Correctly passing the function
router.get('/getallrooms', authMiddleware, roleMiddleware(['admin', 'agent']), getRooms);  // Fix typo in route name ('getallromm' to 'getallrooms')
router.post('/setroom', authMiddleware, roleMiddleware(['admin']), addRoom);
router.get('/getallbookings', authMiddleware, roleMiddleware(['admin', 'agent'], getBookings));
router.post('/addbooking', authMiddleware, roleMiddleware(['admin']), addBooking);




module.exports = router;
