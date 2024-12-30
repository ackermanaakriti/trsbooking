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
      room_details = [],
      complementaries = [],
      total_price = 0,
      additional_note = ''
    } = req.body;

    console.log('checking room details', room_details);
    console.log('request checking', req);

    // Start a transaction
    await connection.beginTransaction();

    // Check if a matching phone number exists in the inquiry table
    const [inquiryResult] = await connection.execute(
      `SELECT id FROM inquiry WHERE customer_phoneno = ?`,
      [phone_number]
    );

    if (inquiryResult.length > 0) {
      // If a match is found, update the status of the inquiry to 'booked'
      const inquiryId = inquiryResult[0].id;
      await connection.execute(
        `UPDATE inquiry SET status = 'booked' WHERE id = ?`,
        [inquiryId]
      );
    }

    // Insert booking details into the bookings table
    const [result] = await connection.execute(
      `INSERT INTO bookings 
      (name, email, phone_number, address, check_in_date, check_out_date, room_details, complementaries, total_price, additional_note, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone_number,
        address, 
        check_in_date, 
        check_out_date, 
        JSON.stringify(room_details || []), 
        JSON.stringify(complementaries || []), 
        total_price, 
        additional_note,
        'booked'
      ]
    );
    console.log('checking result here', result);

    // Commit the transaction to finalize the changes
    await connection.commit();

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Booking added successfully',
      bookingId: result.insertId, // Return inserted booking ID
    });
  } catch (error) {
    // If any error occurs, rollback the transaction
    await connection.rollback();
    console.error('Error adding booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};


exports.getAllbookings = async(req,res)=>{ 
    try {
      const [bookings] = await db.execute('SELECT * FROM bookings');
  
      // Parse JSON fields for better readability
      const formattedBookings = bookings.map((booking) => ({
        ...booking,
        room_details: booking.room_details ? JSON.parse(booking.room_details) : null,
        complementaries: booking.complementaries ? JSON.parse(booking.complementaries) : null,
      }));
  
      res.status(200).json({
        success: true,
        bookings: formattedBookings,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.getBooking = async (req, res) => {
  const { id } = req.params; // Extract booking ID from request parameters

  try {
    // Query to fetch the booking record including JSON data
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
        room_details,
        complementaries,
        created_at
      FROM bookings
      WHERE id = ?;
    `;

    const [result] = await db.execute(bookingQuery, [id]);

    if (!result.length) {
      // If no record is found, return a 404 response
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Parse JSON fields
    const booking = result[0];
    booking.room_details = JSON.parse(booking.room_details || '[]');
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
  const {
    name,
    email,
    phone_number,
    address,
    check_in_date,
    check_out_date,
    room_details,
    complementaries,
    total_price,
    additional_note,
    total_checkedout_price,
    checkout_remarks,
    status,
  } = req.body;

  try {
    // Validate date strings
    // if (check_in_date && isNaN(Date.parse(check_in_date))) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid check-in date format. Use a valid ISO string (e.g., YYYY-MM-DD).',
    //   });
    // }

    // if (check_out_date && isNaN(Date.parse(check_out_date))) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid check-out date format. Use a valid ISO string (e.g., YYYY-MM-DD).',
    //   });
    // }

    // Construct the update query dynamically based on provided fields
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (email !== undefined) fieldsToUpdate.email = email;
    if (phone_number !== undefined) fieldsToUpdate.phone_number = phone_number;
    if (address !== undefined) fieldsToUpdate.address = address;
    if (check_in_date !== undefined) fieldsToUpdate.check_in_date = check_in_date;
    if (check_out_date !== undefined) fieldsToUpdate.check_out_date = check_out_date;
    if (room_details !== undefined) fieldsToUpdate.room_details = JSON.stringify(room_details);
    if (complementaries !== undefined) fieldsToUpdate.complementaries = JSON.stringify(complementaries);
    if (total_price !== undefined) fieldsToUpdate.total_price = total_price;
    if (additional_note !== undefined) fieldsToUpdate.additional_note = additional_note;
    if (total_checkedout_price !== undefined)
      fieldsToUpdate.total_checkedout_price = total_checkedout_price;
    if (checkout_remarks !== undefined) fieldsToUpdate.checkout_remarks = checkout_remarks;
    if (status !== undefined) fieldsToUpdate.status = status;

    // Build query
    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(', ');
    const values = Object.values(fieldsToUpdate);

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update' });
    }

    const [result] = await db.execute(
      `UPDATE bookings SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


exports.deleteBooking = async(req,res)=> 
{ 
    const { id } = req.params;
  
    try {
      const [result] = await db.execute('DELETE FROM bookings WHERE id = ?', [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
  
      res.status(200).json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Error deleting booking:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// exports.getComplementry=async(req,res)=> 
// { 
//   try {
//     const query = 'SELECT * FROM complementaries';
//     db.query(query, (err, results) => {
//       if (err) throw err;
//       console.log('checking result of comlemntry',results)
//       res.json(results);
//     });
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// }
exports.getComplementry = async (req, res) => {
  console.log('checking complementry')
  const [result] = await db.execute('SELECT * FROM complementaries');
  console.log('fetched complemetry',result)
  res.json(result);
};



exports.roomAvailability = async (req, res) => {
  try {
    const { check_in_date, check_out_date, roomId } = req.body;

    console.log('Checking availability for:', { check_in_date, check_out_date, roomId });

    // SQL Query to check room availability and include room_name in the response
    const availabilityQuery = `
      SELECT room_details FROM bookings
      WHERE 
        JSON_CONTAINS(room_details, JSON_OBJECT('room_id', ?)) 
        AND (
          (check_in_date BETWEEN ? AND ?) 
          OR (check_out_date BETWEEN ? AND ?)
        )
    `;

    console.log('Query:', availabilityQuery);

    // Execute the query to check availability
    const [results] = await db.execute(availabilityQuery, [
      roomId, 
      check_in_date, 
      check_out_date,
      check_in_date,
      check_out_date
    ]);

    if (results.length > 0) {
      // Room is not available
      // Extract the room name from the room_details JSON array
      const roomDetails = JSON.parse(results[0].room_details);
      const roomName = roomDetails.find(room => room.room_id === roomId)?.room_name;

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

