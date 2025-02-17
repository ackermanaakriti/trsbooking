const db = require("../config/db");

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const promisePool = pool.promise(); // This allows us to use async/await syntax

exports.addBookings = async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    const {
      name = '',
      email = '',
      phone_number = '',
      address = '',
      check_in_date = '',
      check_out_date = '',
      room_details = [], // Room details with roomId, no_of_person, total_price, room_name
      complementaries = [],
      total_price = 0,
      additional_note = '',
      advance_amount =''
    } = req.body;

    const { branchId } = req;

    const [existingBooking] = await connection.execute(
      `SELECT id FROM bookings WHERE (phone_number = ? OR email = ?) AND branch_id = ?`,
      [phone_number, email,branchId]
    );

    // If the guest has previous bookings, set recurring_guest to true
    const recurring_guest = existingBooking.length > 0;
   const grand_total = total_price + parseInt(advance_amount);
   console.log('gradn total checking',grand_total)
    // Start a transaction
    await connection.beginTransaction();

    // Check if a matching phone number exists in the inquiry table
    const [inquiryResult] = await connection.execute(
      `SELECT id FROM inquiry WHERE customer_phoneno = ? AND branch_id = ?`,
      [phone_number, branchId]
    );

    if (inquiryResult.length > 0) {
      const inquiryId = inquiryResult[0].id;
      await connection.execute(
        `UPDATE inquiry SET status = 'booked' WHERE id = ? AND branch_id=?`,
        [inquiryId,branchId]
      );
    }

    // Insert booking details into the bookings table
    const [result] = await connection.execute(
      `INSERT INTO bookings 
      (name, email, phone_number, address, check_in_date, check_out_date, complementaries, total_price, additional_note, status,grand_total,recurring_guest,advance_amount,branch_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`,
      [
        name,
        email,
        phone_number,
        address,
        check_in_date,
        check_out_date,
        JSON.stringify(complementaries || []),
        total_price,
        additional_note,
        'booked',
        grand_total,
        recurring_guest,
        advance_amount,
        branchId
      ]
    );
    const bookingId = result.insertId;

    // Insert room details into the room_details table
    if (room_details.length > 0) {
      const roomValues = room_details.map(({ room_id, no_of_person, total_price, room_name }) => [
        bookingId, room_id, no_of_person, total_price, room_name,branchId
      ]);
      await connection.query(
        `INSERT INTO room_details (booking_id, room_id, no_of_person, total_price, room_name,branch_id) VALUES ?`,
        [roomValues,branchId]
      );
    }

    // Commit the transaction
    await connection.commit();

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Booking added successfully',
      bookingId: bookingId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    connection.release();
  }
};


exports.getAllbookings = async (req, res) => {
  try {
    const branchId = req.branchId; // Assuming the branchId is added to the request via middleware
  console.log(branchId)
    // Fetch bookings for the specific branch
    const [bookings] = await db.execute(
      'SELECT * FROM bookings WHERE branch_id = ?',
      [branchId]
    );
    console.log('here')

    // For each booking, fetch associated room details from the room_details table
    const formattedBookings = await Promise.all(bookings.map(async (booking) => {
      const [roomDetails] = await db.execute(
        `SELECT * FROM room_details WHERE booking_id = ? AND branch_id = ?`,
        [booking.id, branchId]  // Ensure room details are filtered by the same branch
      );

      return {
        ...booking,
        room_details: roomDetails || [], // Room details now fetched from room_details table
        complementaries: booking.complementaries ? JSON.parse(booking.complementaries) : null,
      };
    }));

    res.status(200).json({
      success: true,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};





exports.getBooking = async (req, res) => {
  const { id } = req.params; // Extract booking ID from request parameters
  const branchId = req.branchId; // Get the branchId from the middleware

  try {
    // Query to fetch the booking record for a specific branch
    const bookingQuery = `
      SELECT 
        id,
        name,
        email,
        phone_number,
        address,
        check_in_date,
        check_out_date,
        total_price,
        additional_note,
        complementaries,
        created_at,
        total_checkedout_price,
        checkout_remarks,
        grand_total,
        advance_amount,
        status
      FROM bookings
      WHERE id = ? AND branch_id = ?;
    `;

    const [result] = await db.execute(bookingQuery, [id, branchId]);

    if (!result.length) {
      // If no record is found, return a 404 response
      return res.status(404).json({ message: 'Booking not found for the specified branch' });
    }

    // Query to fetch the associated room details for the specific branch
    const [roomDetails] = await db.execute(
      `SELECT * FROM room_details WHERE booking_id = ? AND branch_id = ?`, 
      [id, branchId]
    );

    // Parse JSON fields for the booking
    const booking = result[0];
    booking.room_details = roomDetails || [];  // Assign room details if available
    booking.complementaries = JSON.parse(booking.complementaries || '[]');

    // Return the parsed booking data
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const updateFields = [];
  const updateValues = [];
  const branch_id = req.branchId; // Assuming the branchId is added to the request via middleware

  
  console.log('req body,', req.body)

  // Define allowed fields for dynamic updates
  const allowedFields = [
    'name', 'email', 'phone_number', 'address',
    'check_in_date', 'check_out_date', 'complementaries',
    'total_price', 'additional_note', 'total_checkedout_price', 'status','advance_amount',
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(field === 'complementaries' ? JSON.stringify(req.body[field]) : req.body[field]);
    }
  }

  // Add grand_total calculation if total_checkedout_price is provided

  let grandTotal = null;
  console.log('kjlkljkj',req.body.advance_amount)
  

  if(req.body.total_price && req.body.advance_amount)
  { 
    grandTotal =parseInt(req.body.total_price)  + parseInt(req.body.advance_amount);
    console.log('adding value',grandTotal)
    updateFields.push("grand_total = ?");
    updateValues.push(grandTotal);
  }
  else if (req.total_price){ 
    updateFields.push("grand_total = ?");
    updateValues.push(req.body.total_price);
  }
 
  if (req.body.total_checkedout_price) {
    try {
      // Fetch the total_price from the database
      const [booking] = await db.execute(
        `SELECT total_price FROM bookings WHERE id = ? AND branch_id = ?`,
        [id,branch_id]
      );
      const [advanceamount] = await db.execute(
        `SELECT advance_amount FROM bookings WHERE id = ? AND branch_id =?`,
        [id,branch_id]
      );
      if (booking.length === 0) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      const advance_amount = parseFloat(advanceamount[0].advance_amount || 0);
      const totalPrice = parseFloat(booking[0].total_price || 0); // Get total_price from the booking record
      const checkoutTotalPrice = parseFloat(req.body.total_checkedout_price || 0);
      grandTotal = totalPrice + checkoutTotalPrice + advance_amount;
      updateFields.push("grand_total = ?");
      updateValues.push(grandTotal);
    } catch (error) {
      console.error('Error fetching total_price:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  

  // If no fields are provided, return an error
  if (updateFields.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields provided for update' });
  }

  // Add id as the last value for the WHERE clause
  updateValues.push(id);

  try {
    // Update only the provided fields
    // const [result] = await db.execute(
    //   `UPDATE bookings 
    //    SET ${updateFields.join(', ')} 
    //    WHERE id = ?`,
    //   updateValues
    // );
    updateValues.push(branch_id);
    const [result] = await db.execute(
      `UPDATE bookings 
       SET ${updateFields.join(', ')} 
       WHERE id = ? AND branch_id = ?`, // Adding branch_id check in WHERE clause
        updateValues // Pass the branch_id value along with other update values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update room details if provided
    if (Array.isArray(req.body.room_details) && req.body.room_details.length > 0) {
      await db.execute(`DELETE FROM room_details WHERE booking_id = ? AND branch_id=?`, [id,branch_id]);

      for (const room of req.body.room_details) {
        const {
          room_id = '', 
          no_of_person = 0, 
          total_price = 0, 
          room_name = ''
        } = room;

        // Validate if roomId exists in the rooms table
        const [roomExists] = await db.execute(
          `SELECT id FROM rooms WHERE id = ? AND branch_id = ?`, 
          [room_id,branch_id]
        );

        if (roomExists.length === 0) {
          return res.status(400).json({
            success: false, 
            message: `Room with ID ${room_id} does not exist`
          });
        }

        await db.execute(
          `INSERT INTO room_details (booking_id, room_id, no_of_person, total_price, room_name,branch_id)
           VALUES (?, ?, ?, ?, ?,?)`,
          [id, room_id, no_of_person, total_price, room_name,branch_id]
        );
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Booking updated successfully', 
      grand_total: grandTotal 
    });
  } catch (error) {
    console.error('Error updating booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};






exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  const branchId = req.branchId; // Assuming the branchId is added to the request via middleware
  console.log('deleting bookings', id, branchId);

  try {
    // First, delete related room details from the room_details table
    await db.execute('DELETE FROM room_details WHERE booking_id = ? AND branch_id = ?', [id, branchId]);

    // Then, delete the booking from the bookings table
    const [result] = await db.execute('DELETE FROM bookings WHERE id = ? AND branch_id = ?', [id, branchId]);
    console.log(branchId, id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



exports.getComplementry = async (req, res) => {
  const branchId = req.branchId;
  console.log('checking complementry')
  const [result] = await db.execute('SELECT * FROM complementaries WHERE branch_id=?',[branchId]);
  console.log('fetched complemetry',result)
  res.json(result);
};






// exports.roomAvailability = async (req, res) => {
//   try {
//     const { check_in_date, check_out_date, roomId } = req.body;
//     const branchId = req.branchId;

//     console.log('Checking availability for:', { check_in_date, check_out_date, roomId });

//     // SQL query to check room availability by looking inside the room_details JSON
//     const availabilityQuery = `
//     SELECT b.id, rd.room_name
//     FROM bookings b
//     JOIN room_details rd ON rd.booking_id = b.id  -- Linking room details with booking_id
//     WHERE
//       rd.room_id = ? 
//       AND (
//         (b.check_in_date BETWEEN ? AND ?)
//         OR (b.check_out_date BETWEEN ? AND ?)
//       )
//   `;
  
//   const [results] = await db.execute(availabilityQuery, [
//     roomId,
//     check_in_date,
//     check_out_date,
//     check_in_date,
//     check_out_date,
//   ]);
  

//     if (results.length > 0) {
//       // Room is not available
//       const roomName = results[0].room_name;

//       res.json({
//         available: false,
//         message: `Room (${roomName}) is already booked for the selected dates.`,
//       });
//     } else {
//       // Room is available
//       res.json({
//         available: true,
//         message: `Room with ID ${roomId} is available for booking.`,
//       });
//     }
//   } catch (error) {
//     console.error('Error in room availability check:', error);
//     res.status(500).json({ message: error.message });
//   }
// };
exports.roomAvailability = async (req, res) => {
  try {
    const { check_in_date, check_out_date, roomId } = req.body;
    const branchId = req.branchId; // Assuming branchId is coming from req

    console.log('Checking availability for:', { check_in_date, check_out_date, roomId, branchId });

    // SQL query to check room availability, including branch_id filter
    const availabilityQuery = `
      SELECT b.id, rd.room_name
      FROM bookings b
      JOIN room_details rd ON rd.booking_id = b.id  
      WHERE
        rd.room_id = ? 
        AND b.branch_id = ?  
        AND (
          (b.check_in_date BETWEEN ? AND ?)
          OR (b.check_out_date BETWEEN ? AND ?)
        )
    `;
  
    const [results] = await db.execute(availabilityQuery, [
      roomId,
      branchId,  // Add branchId to the query parameters
      check_in_date,
      check_out_date,
      check_in_date,
      check_out_date,
    ]);
  
    if (results.length > 0) {
      // Room is not available
      const roomName = results[0].room_name;

      res.json({
        available: false,
        message: `Room (${roomName}) is already booked for the selected dates.`,
      });
    } else {
      // Room is available
      res.json({
        available: true,
        message: `Room with ID ${roomId} is available for booking.`,
      });
    }
  } catch (error) {
    console.error('Error in room availability check:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.addComplementary = async (req, res) => {
  try {
    const { service_name } = req.body;
    const branchId = req.branchId; // Assuming branchId is coming from req

    if (!service_name) {
      return res.status(400).json({ message: 'Service name is required' });
    }

    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    const query = 'INSERT INTO complementaries (service_name, branch_id) VALUES (?, ?)';

    const [result] = await db.execute(query, [service_name, branchId]);

    const newComplementary = {
      id: result.insertId,
      service_name,
      branch_id: branchId, // Include branch_id in the response
    };

    res.status(201).json(newComplementary);
  } catch (error) {
    console.error('Error adding complementary:', error);
    res.status(500).json({ message: 'Error adding complementary' });
  }
};


exports.deleteComplementary = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.branchId; // Assuming branchId is coming from req

    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    // Modify query to ensure that the complementary belongs to the given branch
    const query = 'DELETE FROM complementaries WHERE id = ? AND branch_id = ?';
    
    const [result] = await db.execute(query, [id, branchId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Complementary not found or does not belong to this branch' });
    }

    res.status(200).json({ message: 'Complementary deleted successfully' });
  } catch (error) {
    console.error('Error deleting complementary:', error);
    res.status(500).json({ message: 'Error deleting complementary' });
  }
};




exports.deleteSelectedRoom = async (req, res) => {
  const { id } = req.params;  // bookingId
  const { roomId } = req.query;  // roomId
  const branchId = req.branchId;

  console.log('Booking id and room id for deletion:', id, roomId);

  try {
    // Step 1: Retrieve the total price of the room being deleted
    const [roomDetails] = await db.execute(
      `SELECT total_price FROM room_details WHERE room_id = ? AND booking_id = ? AND branch_id`,
      [roomId, id,branchId]
    );

    if (roomDetails.length === 0) {
      return res.status(404).json({ message: 'Room or booking not found' });
    }

    const roomTotalPrice = roomDetails[0].total_price;

    // Step 2: Delete the room from the room_details
    const deleteRoomQuery = `
      DELETE FROM room_details
      WHERE room_id = ? AND booking_id = ? AND branch_id =?
    `;

    const [deleteResult] = await db.execute(deleteRoomQuery, [roomId, id,branchId]);

    if (deleteResult.affectedRows > 0) {
      // Step 3: Update the total_price of the booking
      const [bookingDetails] = await db.execute(
        `SELECT total_price FROM bookings WHERE id = ? AND branch_id`,
        [id,branchId]
      );

      const currentTotalPrice = bookingDetails[0]?.total_price || 0;

      // Subtract the deleted room's total price from the current total price
      const newTotalPrice = currentTotalPrice - roomTotalPrice;
      console.log(newTotalPrice)

      // Update the booking's total_price
      const updateBookingQuery = `
        UPDATE bookings
        SET total_price = ?
        WHERE id = ?
        AND branch_id =?
      `;
      await db.execute(updateBookingQuery, [newTotalPrice, id,branchId]);

      res.status(200).json({ message: 'Room removed successfully, total_price updated' });
    } else {
      res.status(404).json({ message: 'Room or booking not found' });
    }
  } catch (error) {
    console.error('Error deleting room:', error.message);
    res.status(500).json({ message: 'Error removing room' });
  }
};



exports.checkRoomAvailabilityForDate = async (req, res) => {
  const branchId = req.branchId;
  console.log('lkjfdkfjdkds',branchId)
    try {
    const { selected_date } = req.body;
  
    console.log('kjlfkjlfdkjl',branchId)
    if (!selected_date) {
      return res.status(400).json({
        success: false,
        message: "Selected date is required",
      });
    }

    console.log("Selected date:", selected_date);

    // Ensure the date is formatted correctly as 'YYYY-MM-DD'
    const date = new Date(selected_date);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    console.log("Formatted date:", formattedDate);

    // Query to find rooms booked for the selected date
    const [unavailableRooms] = await db.query(
      `
      SELECT DISTINCT rd.room_id, rd.no_of_person, rd.total_price, rd.room_name
      FROM room_details rd
      INNER JOIN bookings b ON rd.booking_id = b.id
      WHERE 
        b.check_in_date <= ? 
        AND b.check_out_date >= ? 
        AND b.branch_id = ?
      `,
      [formattedDate, formattedDate, branchId] // Pass the branchId as a parameter
    );

    const unavailableRoomIds = unavailableRooms.map((room) => room.room_id);

    // Query to fetch all rooms
    const [allRooms] = await db.query(
      `SELECT id, room_name 
       FROM rooms 
       WHERE branch_id = ?`,
      [branchId] // Pass the branchId as a parameter
    );

    // Separate available and unavailable rooms
    const availableRooms = allRooms.filter(
      (room) => !unavailableRoomIds.includes(room.id)
    );
    const unavailableRoomDetails = unavailableRooms.map((room) => ({
      room_id: room.room_id,
      room_name: room.room_name,
      no_of_person: room.no_of_person,
      total_price: room.total_price,
    }));

    console.log("Unavailable rooms:", unavailableRoomDetails);
    console.log("Available rooms:", availableRooms);

    // Respond with available and unavailable rooms
    res.status(200).json({
      success: true,
      availableRooms,
      unavailableRooms: unavailableRoomDetails, // Detailed info about unavailable rooms
    });
  } catch (error) {
    console.error("Error checking room availability:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



exports.possiblechecking = async (req, res) => {
 
  const currentDate = new Date();
  const today = currentDate.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  // Get tomorrow's date by adding one day to the current date
  const tomorrowDate = new Date();
  tomorrowDate.setDate(currentDate.getDate() + 1); // Add 1 day to the current date
  const tomorrow = tomorrowDate.toISOString().split('T')[0]; // Get tomorrow's date in YYYY-MM-DD format

  console.log('Current Date:', today);
  console.log('Tomorrow Date:', tomorrow);

  try{ 
    const [checkindata] = await db.execute(
     `  SELECT 
      CASE 
        WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE check_in_date =? OR check_out_date = ?) THEN ?
        ELSE NULL
      END AS possible_checkin_today,
      CASE 
        WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE check_in_date = ? OR check_out_date = ?)THEN ?
        ELSE NULL
      END AS possible_checkin_tomorrow;`,[today,today,today,tomorrow,tomorrow,tomorrow]
    );

    if (checkindata.length === 0) {
      return res.status(404).json({ message: 'checkin not found ' });
    }
    res.json(checkindata[0]);


  }
  catch(err)
  { 
    res.status(500).send(err.message);

  }


 
};