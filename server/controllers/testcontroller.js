const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db'); // Import database connection
const app = express();

app.use(bodyParser.json()); // Parse JSON requests

/**
 * Add Booking API
 */
app.post('/api/add-booking', async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      checkInDate,
      checkOutDate,
      roomId,
      roomDetails,
      complementaries,
      totalPrice,
      additionalNote,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !checkInDate || !checkOutDate || !roomId || !totalPrice) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate date strings
    if (isNaN(Date.parse(checkInDate)) || isNaN(Date.parse(checkOutDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Dates should be valid ISO strings (e.g., YYYY-MM-DD).',
      });
    }

    // Insert booking details into the database
    const [result] = await pool.execute(
      `INSERT INTO bookings 
      (name, email, phone_number, address, check_in_date, check_out_date, room_id, room_details, complementaries, total_price, additional_note) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phoneNumber,
        address || null, // Optional field
        checkInDate, // Stored as string
        checkOutDate, // Stored as string
        roomId,
        JSON.stringify(roomDetails || {}), // Convert to JSON string or empty object
        JSON.stringify(complementaries || []), // Convert to JSON string or empty array
        totalPrice,
        additionalNote || null, // Optional field
      ]
    );

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Booking added successfully',
      bookingId: result.insertId, // Return inserted booking ID
    });
  } catch (error) {
    console.error('Error adding booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Get All Bookings API
 */
app.get('/api/bookings', async (req, res) => {
  try {
    const [bookings] = await pool.execute('SELECT * FROM bookings');

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
});

/**
 * Update Booking API
 */
app.put('/api/update-booking/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    address,
    checkInDate,
    checkOutDate,
    roomId,
    roomDetails,
    complementaries,
    totalPrice,
    additionalNote,
  } = req.body;

  try {
    // Validate date strings
    if (checkInDate && isNaN(Date.parse(checkInDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in date format. Use a valid ISO string (e.g., YYYY-MM-DD).',
      });
    }

    if (checkOutDate && isNaN(Date.parse(checkOutDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-out date format. Use a valid ISO string (e.g., YYYY-MM-DD).',
      });
    }

    // Update the booking
    const [result] = await pool.execute(
      `UPDATE bookings
      SET name = ?, email = ?, phone_number = ?, address = ?, check_in_date = ?, 
          check_out_date = ?, room_id = ?, room_details = ?, complementaries = ?, 
          total_price = ?, additional_note = ?
      WHERE id = ?`,
      [
        name || null,
        email || null,
        phoneNumber || null,
        address || null,
        checkInDate || null,
        checkOutDate || null,
        roomId || null,
        JSON.stringify(roomDetails || {}),
        JSON.stringify(complementaries || []),
        totalPrice || null,
        additionalNote || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Delete Booking API
 */
app.delete('/api/delete-booking/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM bookings WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
