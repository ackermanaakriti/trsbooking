const express = require('express');
const { login, register } = require('../controllers/authcontroller');  // Ensure correct path
const { authMiddleware } = require('../middlewares/authmiddleware');
const roleMiddleware = require('../middlewares/rolemiddleware');
const { getRooms, addRoom, getRoomById, deleteRoom, updateRoom } = require('../controllers/roomcontroller');
const { addBookings, getAllbookings, deleteBooking, updateBooking, getComplementry, roomAvailability, getBooking, addComplementary, deleteComplementary } = require('../controllers/newbookingcontrolller');
const { getInquiry, getInquiryById, deleteInquiry, updateInquiry, addInquiry } = require('../controllers/inquirycontroller');
const { loginUser, registerUser } = require('../controllers/usercontroller');
// const { addBooking, getBooking, deleteBooking, editBooking, getBookingByid } = require('../controllers/bookingcontroller');

const router = express.Router();

router.post('/login', loginUser);  // Correctly passing the function
router.post('/register', registerUser);  // Correctly passing the function
router.get('/getallrooms', getRooms);  // Fix typo in route name ('getallromm' to 'getallrooms')
router.get('/getroom/:id',getRoomById);
router.delete('/room/delete/:id',deleteRoom);
router.put('/room/update/:id',updateRoom);
router.post('/room/add',addRoom);
router.get('/getallinquiry', getInquiry);  // Fix typo in route name ('getallromm' to 'getallrooms')
router.get('/getinquiry/:id',getInquiryById);
router.delete('/inquiry/delete/:id',deleteInquiry);
router.put('/inquiry/update/:id',updateInquiry);
router.post('/inquiry/add',addInquiry);


router.get('/getallbookings', getAllbookings);
router.post('/addbooking',  addBookings);
router.delete('/deletebooking/:id',deleteBooking);
router.put('/updatebooking/:id',updateBooking);
router.get('/complementry',getComplementry);
router.post('/add/complementry',addComplementary);
router.delete('/delete/complementry/:id',deleteComplementary)
router.post('/roomavailability',roomAvailability);
router.get('/getbooking/:id',getBooking)

// router.get('/getbooking/:id',authMiddleware,roleMiddleware(['admin','agent']),ge)





module.exports = router;
