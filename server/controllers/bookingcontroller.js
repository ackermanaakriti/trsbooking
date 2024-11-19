const db = require('../config/db');

exports.getBookings = async (req, res) => {
  const [bookings] = await db.execute('SELECT * FROM bookings');
  res.json(bookings);
};

exports.addBooking = async (req, res) => {
    const { customer_name, checkin_date, checkout_date, room_ids, complementaries, phone_number, additional_notes, total_amount, advance_amount, status, paxDetails } = req.body;
    const { id: created_by } = req.user;
  
    let roomIdsArray = Array.isArray(room_ids) ? room_ids : room_ids.split(',').map(id => parseInt(id, 10));

 
    try {
      // Step 1: Check if selected rooms are active and available
      const [rooms] = await db.execute(`SELECT id, room_name,room_number,status FROM rooms WHERE id IN (${roomIdsArray.join(', ')})`);

      // Log the available rooms for debugging
      console.log('Available rooms:', rooms);
      rooms?.map((room)=>
      { 
        console.log('his checking ',room.status)
      })
    
      const inactiveRooms = rooms?.filter(room => room.status !== 'active');
      console.log('inactive rooms',inactiveRooms)
      if (inactiveRooms.length > 0) {
        // If there are inactive rooms, return an error with the list of inactive rooms
        return res.status(400).json({
          message: 'Some selected rooms are inactive',
          inactiveRooms: inactiveRooms.map(room => room.id)
        });
      }

      const flatRoomIds = room_ids.flat();  // If necessary, flatten the array of room IDs
const placeholders = flatRoomIds.map(() => '?').join(', ');  // Generate '?, ?, ?' for the array

const checkRoomExistenceQuery = `
    SELECT id FROM rooms WHERE id IN (${placeholders})
`;
const [roomsInDatabase] = await db.execute(checkRoomExistenceQuery, flatRoomIds);

// Get all the room IDs that do not exist in the database
const existingRoomIds = roomsInDatabase.map(room => room.id);
const nonExistingRoomIds = flatRoomIds.filter(roomId => !existingRoomIds.includes(roomId));

if (nonExistingRoomIds.length > 0) {
    return res.status(400).json({
        message: 'Some selected rooms do not exist in the system.',
        nonExistingRoomIds
    });
}


// Iterate over each room in flatRoomIds to check availability

const roomAvailabilityPromises = flatRoomIds.map(async (eachroom) => {
  const params = [
      eachroom,  // Room ID to check
      checkin_date, checkout_date, checkin_date, checkout_date, checkin_date, checkout_date
  ];

  // Query to check if the room is already booked during the selected period
  const query = `
      SELECT room_ids 
      FROM bookings
      WHERE room_ids = ?  // Check availability for this room individually
      AND (
          (checkin_date <= ? AND checkout_date >= ?)  // Room is booked before and after the selected dates
          OR (checkin_date BETWEEN ? AND ?)  // Room is booked during the selected period
          OR (checkout_date BETWEEN ? AND ?)  // Room is booked during the selected period
      )
  `;
  
  try {
      // Execute the query and check room availability
      const [roomsAvailability] = await db.execute(query, params);
      console.log(`Availability for room ${eachroom}:`, roomsAvailability);

      // If the room is booked, mark it as unavailable
      if (roomsAvailability.length > 0) {
          return { room: eachroom, available: false };
      }

      // If no bookings overlap, the room is available
      return { room: eachroom, available: true };
  } catch (error) {
      console.error(`Error checking availability for room ${eachroom}:`, error);
      return { room: eachroom, available: false };
  }
});
// Wait for all room availability checks to complete
const availabilityResults = await Promise.all(roomAvailabilityPromises);

// Filter out rooms that are unavailable
const unavailableRooms = availabilityResults.filter(result => !result.available).map(result => result.room);
console.log('Unavailable rooms:', unavailableRooms);

// Return an error if any rooms are unavailable
if (unavailableRooms.length > 0) {
    return res.status(400).json({
        message: 'Some selected rooms are unavailable for the selected dates.',
        unavailableRooms
    });
}
     
      // Step 3: Proceed with the booking if all rooms are available and active
      const [result] = await db.execute(
        'INSERT INTO bookings (customer_name, checkin_date, checkout_date, room_ids, complementaries, phone_number, additional_notes, 	total_amount, created_by, status,advance_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)',
        [customer_name, checkin_date, checkout_date, JSON.stringify(room_ids), JSON.stringify(complementaries), phone_number, additional_notes, total_amount, created_by, status,advance_amount]
      );
  
      const bookingId = result.insertId;
  
    //   const paxInsertPromises = room_ids.map(roomId => {
    //     // Convert roomId to string to match keys in paxDetails
    //     const stringRoomId = roomId.toString();
    
    //     // Log the pax details for debugging
    //     console.log('Checking pax details for roomId:', stringRoomId);
    //     console.log('Pax details:', paxDetails[stringRoomId]);
    
    //     // Log roomId and bookingId for debugging
    //     console.log('Room ID:', roomId);
    //     console.log('Booking ID:', bookingId); // Ensure bookingId is defined
    
    //     // Default values if paxDetails for roomId is not found
    //     const paxDetail = paxDetails[stringRoomId] || { paxCount: 0, amountPerPerson: 0 };
        
    //     const paxCount = paxDetail.paxCount;
    //     const amountPerPerson = paxDetail.amountPerPerson;
    
    //     console.log('Pax count:', paxCount);
    //     console.log('Amount per person:', amountPerPerson);
    
    //     // If bookingId is undefined, handle it or log an error
    //     if (!bookingId) {
    //         console.error('Booking ID is undefined. Cannot insert pax details.');
    //         return Promise.reject(new Error('Booking ID is undefined'));
    //     }
    
    //     // Proceed with the database insert
    //     return db.execute(
    //         'INSERT INTO pax_details (booking_id, room_number, pax_count, price_per_person) VALUES (?, ?, ?, ?)',
    //         [bookingId, roomId, paxCount, amountPerPerson]
    //     );
    // });
    
    // // If you want to wait for all promises to resolve, use Promise.all
    // Promise.all(paxInsertPromises)
    //     .then(() => {
    //         console.log('All pax details inserted successfully.');
    //     })
    //     .catch(err => {
    //         console.error('Error inserting pax details:', err);
    //     });
    
  
      // Step 5: Update room status to inactive (booked)
    

console.log('Room IDs:', flatRoomIds); // Ensure this is a flat array of numbers

flatRoomIds.map((roomId) => {
  return db.execute(
    'UPDATE rooms SET status = "inactive" WHERE id = ?',
    [roomId] // Pass the roomId correctly
  );
});

  
      // Step 6: Respond with success message and booking ID
      res.status(201).json({ message: 'Booking created successfully', bookingId });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  };
  