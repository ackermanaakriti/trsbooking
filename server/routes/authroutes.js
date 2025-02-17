const express = require('express');
const { login, register } = require('../controllers/authcontroller');  // Ensure correct path
const { authMiddleware } = require('../middlewares/authmiddleware');
const roleMiddleware = require('../middlewares/rolemiddleware');
const { getRooms, addRoom, getRoomById, deleteRoom, updateRoom } = require('../controllers/roomcontroller');
const { addBookings, getAllbookings, deleteBooking, updateBooking, getComplementry, roomAvailability, getBooking, addComplementary, deleteComplementary, deleteSelectedRoom, checkRoomAvailabilityDate, checkRoomAvailabilityForDate, possiblechecking } = require('../controllers/newbookingcontrolller');
const { getInquiry, getInquiryById, deleteInquiry, updateInquiry, addInquiry } = require('../controllers/inquirycontroller');
const { loginUser, registerUser, updateUser, getUsersByid, getAllUsers, deleteUser } = require('../controllers/usercontroller');
const { allbranches, addbranches, editbracnh, deletebranch } = require('../controllers/branchcontroller');
const { branchMiddleware } = require('../middlewares/branchmiddleware');
// const { addBooking, getBooking, deleteBooking, editBooking, getBookingByid } = require('../controllers/bookingcontroller');
const router = express.Router();

router.post('/login', loginUser);  // Correctly passing the function
router.post('/register', registerUser);  // Correctly passing the function
router.get('/getallrooms',branchMiddleware, getRooms);  // Fix typo in route name ('getallromm' to 'getallrooms')
router.get('/getroom/:id',branchMiddleware,getRoomById);
router.delete('/room/delete/:id',branchMiddleware,deleteRoom);
router.put('/room/update/:id',branchMiddleware,updateRoom);
router.post('/room/add',branchMiddleware,addRoom);
router.get('/getallinquiry',branchMiddleware, getInquiry);  // Fix typo in route name ('getallromm' to 'getallrooms')
router.get('/getinquiry/:id',branchMiddleware,getInquiryById);
router.delete('/inquiry/delete/:id',branchMiddleware,deleteInquiry);
router.put('/inquiry/update/:id',branchMiddleware,updateInquiry);
router.post('/inquiry/add',branchMiddleware,addInquiry);

router.get('/possiblecheckins',branchMiddleware, possiblechecking);
router.get('/getallbookings',branchMiddleware, getAllbookings);
router.post('/addbooking',branchMiddleware,  addBookings);
router.delete('/deletebooking/:id',branchMiddleware,deleteBooking);
router.put('/updatebooking/:id',branchMiddleware,updateBooking);
router.get('/complementry',branchMiddleware,getComplementry);
router.post('/add/complementry',branchMiddleware,addComplementary);
router.delete('/delete/complementry/:id',branchMiddleware,deleteComplementary)
router.post('/roomavailability',branchMiddleware,roomAvailability);
router.get('/getbooking/:id',branchMiddleware,getBooking)
router.delete('/deleteSelected_room/:id',branchMiddleware,deleteSelectedRoom)
router.post('/check-room-date-available',branchMiddleware,checkRoomAvailabilityForDate)
router.put('/updateusers/:id',branchMiddleware,updateUser);
router.get('/getuserdata/:id',branchMiddleware,getUsersByid);
router.get('/getalluser',branchMiddleware,getAllUsers);
router.delete('/deleteuser/:id',branchMiddleware,deleteUser);
router.get('/allbranches',allbranches)
router.post('/addbranch',addbranches);
router.put('/editbranch/:id',editbracnh);
router.delete('/deletebranch/:id',deletebranch)


// router.get('/getbooking/:id',authMiddleware,roleMiddleware(['admin','agent']),ge)





module.exports = router;
