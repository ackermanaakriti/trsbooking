const db = require("../config/db");

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const promisePool = pool.promise(); // This allows us to use async/await syntax

// exports.addBookings = async (req, res) => {
//   const connection = await promisePool.getConnection();
//   try {
//     const {
//       name = '',
//       email = '',
//       phone_number = '',
//       address = '',
//       check_in_date = '',
//       check_out_date = '',
//       room_details = [],
//       complementaries = [],
//       total_price = 0,
//       additional_note = ''
//     } = req.body;

//     console.log('checking room details', room_details);
//     console.log('request checking', req);

//     // Start a transaction
//     await connection.beginTransaction();

//     // Check if a matching phone number exists in the inquiry table
//     const [inquiryResult] = await connection.execute(
//       `SELECT id FROM inquiry WHERE customer_phoneno = ?`,
//       [phone_number]
//     );

//     if (inquiryResult.length > 0) {
//       // If a match is found, update the status of the inquiry to 'booked'
//       const inquiryId = inquiryResult[0].id;
//       await connection.execute(
//         `UPDATE inquiry SET status = 'booked' WHERE id = ?`,
//         [inquiryId]
//       );
//     }

//     // Insert booking details into the bookings table
//     const [result] = await connection.execute(
//       `INSERT INTO bookings 
//       (name, email, phone_number, address, check_in_date, check_out_date, room_details, complementaries, total_price, additional_note, status) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         name,
//         email,
//         phone_number,
//         address, 
//         check_in_date, 
//         check_out_date, 
//         JSON.stringify(room_details || []), 
//         JSON.stringify(complementaries || []), 
//         total_price, 
//         additional_note,
//         'booked'
//       ]
//     );
//     console.log('checking result here', result);

//     // Commit the transaction to finalize the changes
//     await connection.commit();

//     // Respond with success
//     res.status(201).json({
//       success: true,
//       message: 'Booking added successfully',
//       bookingId: result.insertId, // Return inserted booking ID
//     });
//   } catch (error) {
//     // If any error occurs, rollback the transaction
//     await connection.rollback();
//     console.error('Error adding booking:', error.message);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   } finally {
//     // Release the connection back to the pool
//     connection.release();
//   }
// };
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
      additional_note = ''
    } = req.body;

    console.log('checking room details', room_details);
   const grand_total = total_price;
    // Start a transaction
    await connection.beginTransaction();

    // Check if a matching phone number exists in the inquiry table
    const [inquiryResult] = await connection.execute(
      `SELECT id FROM inquiry WHERE customer_phoneno = ?`,
      [phone_number]
    );

    if (inquiryResult.length > 0) {
      const inquiryId = inquiryResult[0].id;
      await connection.execute(
        `UPDATE inquiry SET status = 'booked' WHERE id = ?`,
        [inquiryId]
      );
    }

    // Insert booking details into the bookings table
    const [result] = await connection.execute(
      `INSERT INTO bookings 
      (name, email, phone_number, address, check_in_date, check_out_date, complementaries, total_price, additional_note, status,grand_total) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
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
        grand_total
      ]
    );
    const bookingId = result.insertId;

    // Insert room details into the room_details table
    if (room_details.length > 0) {
      const roomValues = room_details.map(({ room_id, no_of_person, total_price, room_name }) => [
        bookingId, room_id, no_of_person, total_price, room_name
      ]);
      await connection.query(
        `INSERT INTO room_details (booking_id, room_id, no_of_person, total_price, room_name) VALUES ?`,
        [roomValues]
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


// exports.getAllbookings = async(req,res)=>{ 
//     try {
//       const [bookings] = await db.execute('SELECT * FROM bookings');
  
//       // Parse JSON fields for better readability
//       const formattedBookings = bookings.map((booking) => ({
//         ...booking,
//         room_details: booking.room_details ? JSON.parse(booking.room_details) : null,
//         complementaries: booking.complementaries ? JSON.parse(booking.complementaries) : null,
//       }));
  
//       res.status(200).json({
//         success: true,
//         bookings: formattedBookings,
//       });
//     } catch (error) {
//       console.error('Error fetching bookings:', error.message);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// }
exports.getAllbookings = async (req, res) => {
  try {
    const [bookings] = await db.execute('SELECT * FROM bookings');

    // For each booking, fetch associated room details from the room_details table
    const formattedBookings = await Promise.all(bookings.map(async (booking) => {
      const [roomDetails] = await db.execute(
        `SELECT * FROM room_details WHERE booking_id = ?`,
        [booking.id]
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


// exports.getBooking = async (req, res) => {
//   const { id } = req.params; // Extract booking ID from request parameters

//   try {
//     // Query to fetch the booking record including JSON data
//     const bookingQuery = `
//       SELECT 
//         id,
//         name,
//         email,
//         phone_number,
//         address,
//         check_in_date,
//         check_out_date,
//         total_price,
//         additional_note,
//         room_details,
//         complementaries,
//         created_at
//       FROM bookings
//       WHERE id = ?;
//     `;

//     const [result] = await db.execute(bookingQuery, [id]);

//     if (!result.length) {
//       // If no record is found, return a 404 response
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     // Parse JSON fields
//     const booking = result[0];
//     booking.room_details = JSON.parse(booking.room_details || '[]');
//     booking.complementaries = JSON.parse(booking.complementaries || '[]');

//     // Return the parsed booking data
//     res.status(200).json(booking);
//   } catch (error) {
//     console.error('Error fetching booking:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };

exports.getBooking = async (req, res) => {
  const { id } = req.params; // Extract booking ID from request parameters

  try {
    // Query to fetch the booking record
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
        grand_total

      FROM bookings
      WHERE id = ?;
    `;

    const [result] = await db.execute(bookingQuery, [id]);

    if (!result.length) {
      // If no record is found, return a 404 response
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Query to fetch the associated room details
    const [roomDetails] = await db.execute(
      `SELECT * FROM room_details WHERE booking_id = ?`, 
      [id]
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

  // Define allowed fields for dynamic updates
  const allowedFields = [
    'name', 'email', 'phone_number', 'address',
    'check_in_date', 'check_out_date', 'complementaries',
    'total_price', 'additional_note', 'total_checkedout_price', 'status'
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(field === 'complementaries' ? JSON.stringify(req.body[field]) : req.body[field]);
    }
  }

  // Add grand_total calculation if total_checkedout_price is provided
  let grandTotal = null;
  if(req.total_price)
  { 
    updateFields.push("grand_total = ?");
    updateValues.push(total_price);
  }
  if (req.body.total_checkedout_price) {
    try {
      // Fetch the total_price from the database
      const [booking] = await db.execute(
        `SELECT total_price FROM bookings WHERE id = ?`,
        [id]
      );
  
      if (booking.length === 0) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
  
      const totalPrice = parseFloat(booking[0].total_price || 0); // Get total_price from the booking record
      const checkoutTotalPrice = parseFloat(req.body.total_checkedout_price || 0);
      grandTotal = totalPrice + checkoutTotalPrice;
  
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
    const [result] = await db.execute(
      `UPDATE bookings 
       SET ${updateFields.join(', ')} 
       WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update room details if provided
    if (Array.isArray(req.body.room_details) && req.body.room_details.length > 0) {
      await db.execute(`DELETE FROM room_details WHERE booking_id = ?`, [id]);

      for (const room of req.body.room_details) {
        const {
          room_id = '', 
          no_of_person = 0, 
          total_price = 0, 
          room_name = ''
        } = room;

        // Validate if roomId exists in the rooms table
        const [roomExists] = await db.execute(
          `SELECT id FROM rooms WHERE id = ?`, 
          [room_id]
        );

        if (roomExists.length === 0) {
          return res.status(400).json({
            success: false, 
            message: `Room with ID ${room_id} does not exist`
          });
        }

        await db.execute(
          `INSERT INTO room_details (booking_id, room_id, no_of_person, total_price, room_name)
           VALUES (?, ?, ?, ?, ?)`,
          [id, room_id, no_of_person, total_price, room_name]
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




// exports.updateBooking = async (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     email,
//     phone_number,
//     address,
//     check_in_date,
//     check_out_date,
//     room_details,
//     complementaries,
//     total_price,
//     additional_note,
//     total_checkedout_price,
//     checkout_remarks,
//     status,
//   } = req.body;

//   try {
//     // Construct the update query dynamically based on provided fields
//     const fieldsToUpdate = {};
//     if (name !== undefined) fieldsToUpdate.name = name;
//     if (email !== undefined) fieldsToUpdate.email = email;
//     if (phone_number !== undefined) fieldsToUpdate.phone_number = phone_number;
//     if (address !== undefined) fieldsToUpdate.address = address;
//     if (check_in_date !== undefined) fieldsToUpdate.check_in_date = check_in_date;
//     if (check_out_date !== undefined) fieldsToUpdate.check_out_date = check_out_date;
//     if (total_price !== undefined) fieldsToUpdate.total_price = total_price;
//         if (complementaries !== undefined) fieldsToUpdate.complementaries = JSON.stringify(complementaries);

//     if (additional_note !== undefined) fieldsToUpdate.additional_note = additional_note;
//     if (total_checkedout_price !== undefined)
//       fieldsToUpdate.total_checkedout_price = total_checkedout_price;
//     if (checkout_remarks !== undefined) fieldsToUpdate.checkout_remarks = checkout_remarks;
//     if (status !== undefined) fieldsToUpdate.status = status;

//     // Build query
// // Ensure null is passed instead of undefined
// const safeFields = Object.entries(fieldsToUpdate).reduce((acc, [key, value]) => {
//   acc[key] = value === undefined ? "" : value; // Replace undefined with empty string
//   return acc;
// }, {});

// const setClause = Object.keys(safeFields)
//   .map((field) => `${field} = ?`)
//   .join(', ');

// const values = Object.values(safeFields);
// console.log('set clause',setClause)

// // Ensure no undefined values are passed
// if (setClause.length === 0) {
//   return res.status(400).json({ success: false, message: 'No fields provided for update' });
// }

// const [result] = await db.execute(
//   `UPDATE bookings SET ${setClause} WHERE id = ?`,
//   [...values, id]
// );




//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Booking not found' });
//     }

//     // If room details are provided, update them in the room_details table
//     if (room_details !== undefined) {
//       // Delete existing room details
//       await db.execute(`DELETE FROM room_details WHERE booking_id = ?`, [id]);

//       // Insert new room details into room_details table
//       for (const room of room_details) {
//         const { roomId, no_of_person, total_price, room_name } = room;
//         await db.execute(
//           `INSERT INTO room_details (booking_id, room_id, no_of_person, total_price, room_name) 
//           VALUES (?, ?, ?, ?, ?)`,
//           [id, roomId, no_of_person, total_price, room_name]
//         );
//       }
//     }

//     res.status(200).json({ success: true, message: 'Booking updated successfully' });
//   } catch (error) {
//     console.error('Error updating booking:', error.message);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// exports.deleteBooking = async(req,res)=> 
// { 
//     const { id } = req.params;
  
//     try {
//       const [result] = await db.execute('DELETE FROM bookings WHERE id = ?', [id]);
  
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ success: false, message: 'Booking not found' });
//       }
  
//       res.status(200).json({ success: true, message: 'Booking deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting booking:', error.message);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// }

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

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // First, delete related room details from the room_details table
    await db.execute('DELETE FROM room_details WHERE booking_id = ?', [id]);

    // Then, delete the booking from the bookings table
    const [result] = await db.execute('DELETE FROM bookings WHERE id = ?', [id]);

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
  console.log('checking complementry')
  const [result] = await db.execute('SELECT * FROM complementaries');
  console.log('fetched complemetry',result)
  res.json(result);
};



// exports.roomAvailability = async (req, res) => {
//   try {
//     const { check_in_date, check_out_date, roomId } = req.body;

//     console.log('Checking availability for:', { check_in_date, check_out_date, roomId });

//     // SQL Query to check room availability and include room_name in the response
//     const availabilityQuery = `
//       SELECT room_details FROM bookings
//       WHERE 
//         JSON_CONTAINS(room_details, JSON_OBJECT('roomId', ?)) 
//         AND (
//           (check_in_date BETWEEN ? AND ?) 
//           OR (check_out_date BETWEEN ? AND ?)
//         )
//     `;

//     console.log('Query:', availabilityQuery);

//     // Execute the query to check availability
//     const [results] = await db.execute(availabilityQuery, [
//       roomId, 
//       check_in_date, 
//       check_out_date,
//       check_in_date,
//       check_out_date
//     ]);

//     if (results.length > 0) {
//       // Room is not available
//       // Extract the room name from the room_details JSON array
//       const roomDetails = JSON.parse(results[0].room_details);
//       const roomName = roomDetails.find(room => room.roomId === roomId)?.room_name;

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

    console.log('Checking availability for:', { check_in_date, check_out_date, roomId });

    // SQL query to check room availability by looking inside the room_details JSON
    const availabilityQuery = `
    SELECT b.id, rd.room_name
    FROM bookings b
    JOIN room_details rd ON rd.booking_id = b.id  -- Linking room details with booking_id
    WHERE
      rd.room_id = ? 
      AND (
        (b.check_in_date BETWEEN ? AND ?)
        OR (b.check_out_date BETWEEN ? AND ?)
      )
  `;
  
  const [results] = await db.execute(availabilityQuery, [
    roomId,
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
    if (!service_name) {
      return res.status(400).json({ message: 'Service name is required' });
    }

    const query = 'INSERT INTO complementaries (service_name) VALUES (?)';

    const [result] = await db.execute(query, [service_name]);

    const newComplementary = {
      id: result.insertId,
      service_name,
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
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const query = 'DELETE FROM complementaries WHERE id = ?';
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Complementary not found' });
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

  console.log('Booking id and room id for deletion:', id, roomId);

  try {
    // SQL query to delete the room from the booking's room_details
    const deleteRoomQuery = `
      DELETE FROM room_details
      WHERE room_id = ? AND booking_id = ?
    `;

    // Execute the query
    const [result] = await db.execute(deleteRoomQuery, [roomId, id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Room removed successfully' });
    } else {
      res.status(404).json({ message: 'Room or booking not found' });
    }
  } catch (error) {
    console.error('Error deleting room:', error.message);
    res.status(500).json({ message: 'Error removing room' });
  }
};
