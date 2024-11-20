const db = require('../config/db');

exports.addBooking = async (req, res) => {
  const {
    customer_name,
    checkin_date,
    checkout_date,
    room_ids,
    complementaries,
    phone_number,
    additional_notes,
    total_amount,
    advance_amount,
    status,
    paxDetails,
  } = req.body;
  const { id: created_by } = req.user;

  try {
    // Step 1: Parse and validate room IDs
    const roomIdsArray = Array.isArray(room_ids)
      ? room_ids
      : room_ids.split(',').map((id) => parseInt(id, 10));

    // Check if all room IDs exist in the system
    const placeholders = roomIdsArray.map(() => '?').join(', ');
    const checkRoomExistenceQuery = `
      SELECT id FROM rooms WHERE id IN (${placeholders})
    `;
    const [roomsInDatabase] = await db.execute(checkRoomExistenceQuery, roomIdsArray);

    // Validate room existence
    const existingRoomIds = roomsInDatabase.map((room) => room.id);
    const nonExistingRoomIds = roomIdsArray.filter(
      (roomId) => !existingRoomIds.includes(roomId)
    );

    if (nonExistingRoomIds.length > 0) {
      return res.status(400).json({
        message: 'Some selected rooms do not exist in the system.',
        nonExistingRoomIds,
      });
    }

    // Step 2: Check if rooms are active
    const [activeRooms] = await db.execute(
      `SELECT id, status FROM rooms WHERE id IN (${placeholders})`,
      roomIdsArray
    );

    const inactiveRooms = activeRooms.filter((room) => room.status !== 'active');
    if (inactiveRooms.length > 0) {
      return res.status(400).json({
        message: 'Some selected rooms are inactive.',
        inactiveRooms: inactiveRooms.map((room) => room.id),
      });
    }

    // Step 3: Check room availability
    const roomAvailabilityPromises = roomIdsArray.map(async (eachRoom) => {
      const query = `
        SELECT id FROM bookings
        WHERE JSON_CONTAINS(room_ids, JSON_ARRAY(?))
        AND (
          (checkin_date <= ? AND checkout_date >= ?)
          OR (checkin_date BETWEEN ? AND ?)
          OR (checkout_date BETWEEN ? AND ?)
        )
      `;
      const params = [
        eachRoom,
        checkin_date,
        checkout_date,
        checkin_date,
        checkout_date,
        checkin_date,
        checkout_date,
      ];

      const [roomsAvailability] = await db.execute(query, params);

      // If room is booked, mark as unavailable
      if (roomsAvailability.length > 0) {
        return { room: eachRoom, available: false };
      }

      return { room: eachRoom, available: true };
    });

    const availabilityResults = await Promise.all(roomAvailabilityPromises);

    // Check for unavailable rooms
    const unavailableRooms = availabilityResults
      .filter((result) => !result.available)
      .map((result) => result.room);

    if (unavailableRooms.length > 0) {
      return res.status(400).json({
        message: 'Some rooms are unavailable for the selected dates.',
        unavailableRooms,
      });
    }

    // Step 4: Proceed with the booking
    const [result] = await db.execute(
      'INSERT INTO bookings (customer_name, checkin_date, checkout_date, room_ids, complementaries, phone_number, additional_notes, total_amount, created_by, status, advance_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        customer_name,
        checkin_date,
        checkout_date,
        JSON.stringify(room_ids),
        JSON.stringify(complementaries),
        phone_number,
        additional_notes,
        total_amount,
        created_by,
        status,
        advance_amount,
      ]
    );

    const bookingId = result.insertId;

    // // Step 5: Update room statuses to inactive
    // const updateRoomPromises = roomIdsArray.map((roomId) =>
    //   db.execute('UPDATE rooms SET status = "inactive" WHERE id = ?', [roomId])
    // );
    // await Promise.all(updateRoomPromises);

    // Step 6: Respond with success message
    res.status(201).json({ message: 'Booking created successfully', bookingId });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'An error occurred while creating the booking.', error: err.message });
  }
};
