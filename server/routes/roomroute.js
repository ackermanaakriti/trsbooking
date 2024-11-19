const express = require('express');
const { getRooms, addRoom } = require('../controllers/bookingcontroller');
const { authMiddleware } = require('../middlewares/authmiddleware');  // Correct import
const roleMiddleware = require('../middlewares/rolemiddleware');  // Correct import
const router = express.Router();

router.get('/getallrooms', authMiddleware, roleMiddleware(['admin', 'agent']), getRooms);  // Fix typo in route name ('getallromm' to 'getallrooms')
router.post('/setroom', authMiddleware, roleMiddleware(['admin']), addRoom);

module.exports = router;

