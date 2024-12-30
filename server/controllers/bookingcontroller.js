// const db = require('../config/db');

// exports.addBooking = async (req, res) => {
//   const {
//     customer_name,
//     checkin_date,
//     checkout_date,
//     roomData,
//     complementaries,
//     phone_number,
//     additional_notes,
//     total_amount,
//     advance_amount,
//     status,
//   } = req.body;
//   const { id: created_by } = req.user;

//   try {
//     // Step 1: Parse and validate room IDs
//     const roomIdsArray = Array.isArray(room_ids)
//       ? room_ids
//       : room_ids.split(',').map((id) => parseInt(id, 10));

//     // Check if all room IDs exist in the system
//     const placeholders = roomIdsArray.map(() => '?').join(', ');
//     const checkRoomExistenceQuery = `
//       SELECT id FROM rooms WHERE id IN (${placeholders})
//     `;
//     const [roomsInDatabase] = await db.execute(checkRoomExistenceQuery, roomIdsArray);

//     // Validate room existence
//     const existingRoomIds = roomsInDatabase.map((room) => room.id);
//     const nonExistingRoomIds = roomIdsArray.filter(
//       (roomId) => !existingRoomIds.includes(roomId)
//     );

//     if (nonExistingRoomIds.length > 0) {
//       return res.status(400).json({
//         message: 'Some selected rooms do not exist in the system.',
//         nonExistingRoomIds,
//       });
//     }

//     // Step 2: Check if rooms are active
//     const [activeRooms] = await db.execute(
//       `SELECT id, status FROM rooms WHERE id IN (${placeholders})`,
//       roomIdsArray
//     );

//     const inactiveRooms = activeRooms.filter((room) => room.status !== 'active');
//     if (inactiveRooms.length > 0) {
//       return res.status(400).json({
//         message: 'Some selected rooms are inactive.',
//         inactiveRooms: inactiveRooms.map((room) => room.id),
//       });
//     }

//     // Step 3: Check room availability
//     const roomAvailabilityPromises = roomIdsArray.map(async (eachRoom) => {
//       const query = `
//         SELECT id FROM bookings
//         WHERE JSON_CONTAINS(room_ids, JSON_ARRAY(?))
//         AND (
//           (checkin_date <= ? AND checkout_date >= ?)
//           OR (checkin_date BETWEEN ? AND ?)
//           OR (checkout_date BETWEEN ? AND ?)
//         )
//       `;
//       const params = [
//         eachRoom,
//         checkin_date,
//         checkout_date,
//         checkin_date,
//         checkout_date,
//         checkin_date,
//         checkout_date,
//       ];

//       const [roomsAvailability] = await db.execute(query, params);

//       // If room is booked, mark as unavailable
//       if (roomsAvailability.length > 0) {
//         return { room: eachRoom, available: false };
//       }

//       return { room: eachRoom, available: true };
//     });

//     const availabilityResults = await Promise.all(roomAvailabilityPromises);

//     // Check for unavailable rooms
//     const unavailableRooms = availabilityResults
//       .filter((result) => !result.available)
//       .map((result) => result.room);

//     if (unavailableRooms.length > 0) {
//       return res.status(400).json({
//         message: 'Some rooms are unavailable for the selected dates.',
//         unavailableRooms,
//       });
//     }

//     // Step 4: Proceed with the booking
//     const [result] = await db.execute(
//       'INSERT INTO bookings (customer_name, checkin_date, checkout_date, room_ids, complementaries, phone_number, additional_notes, total_amount, created_by, status, advance_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//       [
//         customer_name,
//         checkin_date,
//         checkout_date,
//         JSON.stringify(room_ids),
//         JSON.stringify(complementaries),
//         phone_number,
//         additional_notes,
//         total_amount,
//         created_by,
//         status,
//         advance_amount,
//       ]
//     );

//     const bookingId = result.insertId;

//     // // Step 5: Update room statuses to inactive
//     // const updateRoomPromises = roomIdsArray.map((roomId) =>
//     //   db.execute('UPDATE rooms SET status = "inactive" WHERE id = ?', [roomId])
//     // );
//     // await Promise.all(updateRoomPromises);

//     // Step 6: Respond with success message
//     res.status(201).json({ message: 'Booking created successfully', bookingId });
//   } catch (err) {
//     console.error('Error creating booking:', err);
//     res.status(500).json({ message: 'An error occurred while creating the booking.', error: err.message });
//   }
// };
// exports.getBooking = async(req,res)=> 
// { 
// try{ 
// const query = 'SELECT * FROM bookings';
// const [result] = await db.execute(query)
// res.status(200).json({message:"Booking fetched successfully",result})
// }
// catch(err){ 
//  res.status(500).json({message:"An error occured while fetching booking",error:err.message})
// }
// }

// exports.deleteBooking = async(req,res)=>
// { 
//   const {id}= req.params;
//   try{ 
//    const query = 'DELETE FROM bookings WHERE id=?';
//    const [result]= await db.execute(query,[id]);
//    if (result.affectedRows > 0) {
//     res.status(200).json({
//       message: "Booking deleted successfully",
//     });
//   } else {
//     res.status(404).json({
//       message: "No booking found with the given ID",
//     });
//   }
//   }
//   catch(err) { 
//   res.status(500).json({message:"An error occured while fetching booking",error:err.message})
//   }
// }


// // exports.editBooking = async (req, res) => {
// //   const {
// //     customer_name,
// //     checkin_date,
// //     checkout_date,
// //     room_ids,
// //     complementaries,
// //     phone_number,
// //     additional_notes,
// //     total_amount,
// //     advance_amount,
// //     status,
// //   } = req.body;
// //   const { id } = req.params;

// //   try {
// //     const roomIdsArray = Array.isArray(room_ids)
// //       ? room_ids
// //       : room_ids.split(',').map((id) => parseInt(id, 10));

// //     // Step 1: Check if rooms are active
// //     const placeholders = roomIdsArray?.map(() => '?').join(', ');
// //     const activeRoomQuery = `SELECT id, status FROM rooms WHERE id IN (${placeholders})`;
// //     const [rooms] = await db.execute(activeRoomQuery, roomIdsArray);

// //     // Validate active rooms
// //     const inactiveRooms = rooms.filter((room) => room.status !== 'active');
// //     if (inactiveRooms.length > 0) {
// //       return res.status(400).json({
// //         message: 'Some rooms are inactive and cannot be updated.',
// //         unavailableRooms: inactiveRooms.map((room) => room.id),
// //       });
// //     }

// //     // Step 2: Check room availability
// //     const roomAvailabilityPromises = roomIdsArray.map(async (roomId) => {
// //       const query = `
// //         SELECT id FROM bookings
// //         WHERE JSON_CONTAINS(room_ids, JSON_ARRAY(?))
// //         AND id != ? 
// //         AND (
// //           (checkin_date <= ? AND checkout_date >= ?)
// //           OR (checkin_date BETWEEN ? AND ?)
// //           OR (checkout_date BETWEEN ? AND ?)
// //         )
// //       `;
// //       const params = [
// //         roomId,
// //         id, // Exclude current booking
// //         checkin_date,
// //         checkout_date,
// //         checkin_date,
// //         checkout_date,
// //         checkin_date,
// //         checkout_date,
// //       ];

// //       const [roomsAvailability] = await db.execute(query, params);

// //       if (roomsAvailability.length > 0) {
// //         return { room: roomId, available: false };
// //       }

// //       return { room: roomId, available: true };
// //     });

// //     const availabilityResults = await Promise.all(roomAvailabilityPromises);

// //     const unavailableRooms = availabilityResults
// //       .filter((result) => !result.available)
// //       .map((result) => result.room);

// //     if (unavailableRooms.length > 0) {
// //       return res.status(400).json({
// //         message: 'Some rooms are unavailable for the selected dates.',
// //         unavailableRooms,
// //       });
// //     }

// //     // Step 3: Update the booking
// //     const query = `
// //       UPDATE bookings
// //       SET 
// //         customer_name = ?, 
// //         checkin_date = ?, 
// //         checkout_date = ?, 
// //         room_ids = ?, 
// //         complementaries = ?, 
// //         phone_number = ?, 
// //         additional_notes = ?, 
// //         total_amount = ?, 
// //         advance_amount = ?, 
// //         status = ?
// //       WHERE id = ?
// //     `;
// //     const [result] = await db.execute(query, [
// //       customer_name,
// //       checkin_date,
// //       checkout_date,
// //       JSON.stringify(roomIdsArray),
// //       JSON.stringify(complementaries),
// //       phone_number,
// //       additional_notes,
// //       total_amount,
// //       advance_amount,
// //       status,
// //       id,
// //     ]);

// //     if (result.affectedRows > 0) {
// //       res.status(200).json({ message: 'Booking updated successfully' });
// //     } else {
// //       res.status(404).json({ message: 'Booking not found' });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: 'An error occurred while updating the booking.', error: err.message });
// //   }
// // };


// exports.editBooking = async (req, res) => {
//   const {
//     customer_name,
//     checkin_date,
//     checkout_date,
//     room_ids,
//     roomInputs,
//     complementaries,
//     phone_number,
//     additional_notes,
//     total_amount,
//     advance_amount,
//     status,
//   } = req.body;
//   const { id } = req.params;

//   // Start transaction
//   const connection = await db.getConnection();
//   await connection.beginTransaction();

//   try {
//     // Parse room_ids
//     const roomIdsArray = Array.isArray(room_ids)
//       ? room_ids
//       : JSON.parse(room_ids);

//     // Validate room status
//     const placeholders = roomIdsArray.map(() => '?').join(', ');
//     const activeRoomQuery = `SELECT id, status FROM rooms WHERE id IN (${placeholders})`;
//     const [rooms] = await connection.execute(activeRoomQuery, roomIdsArray);

//     const inactiveRooms = rooms.filter((room) => room.status !== 'active');
//     if (inactiveRooms.length > 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message: 'Some rooms are inactive and cannot be updated.',
//         unavailableRooms: inactiveRooms.map((room) => room.id),
//       });
//     }

//     // Validate room availability
//     for (const roomId of roomIdsArray) {
//       const query = `
//         SELECT id FROM bookings
//         WHERE JSON_CONTAINS(room_ids, JSON_ARRAY(?))
//         AND id != ? 
//         AND (
//           (checkin_date <= ? AND checkout_date >= ?)
//           OR (checkin_date BETWEEN ? AND ?)
//           OR (checkout_date BETWEEN ? AND ?)
//         )
//       `;
//       const [availability] = await connection.execute(query, [
//         roomId,
//         id,
//         checkin_date,
//         checkout_date,
//         checkin_date,
//         checkout_date,
//         checkin_date,
//         checkout_date,
//       ]);

//       if (availability.length > 0) {
//         await connection.rollback();
//         return res.status(400).json({
//           message: `Room ${roomId} is unavailable for the selected dates.`,
//         });
//       }
//     }

//     // Update booking
//     const query = `
//       UPDATE bookings
//       SET 
//         customer_name = ?, 
//         checkin_date = ?, 
//         checkout_date = ?, 
//         room_ids = ?, 
//         complementaries = ?, 
//         phone_number = ?, 
//         additional_notes = ?, 
//         total_amount = ?, 
//         advance_amount = ?, 
//         status = ?
//       WHERE id = ?
//     `;
//     const [result] = await connection.execute(query, [
//       customer_name,
//       checkin_date,
//       checkout_date,
//       JSON.stringify(roomIdsArray),
//       JSON.stringify(complementaries),
//       phone_number,
//       additional_notes,
//       total_amount,
//       advance_amount,
//       status,
//       id,
//     ]);

//     if (result.affectedRows === 0) {
//       await connection.rollback();
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     // Update roomInputs
//     if (roomInputs && roomInputs.length > 0) {
//       // Delete existing roomInputs for this booking
//       await connection.execute(`DELETE FROM roominputs WHERE booking_id = ?`, [id]);

//       // Insert new roomInputs
//       const roomInputsQuery = `
//         INSERT INTO roominputs (booking_id, room_id, total_price, number_of_persons, additional_notes)
//         VALUES (?, ?, ?, ?, ?)
//       `;
//       const roomInputsPromises = roomInputs.map((input) =>
//         connection.execute(roomInputsQuery, [
//           id,
//           input.room_id,
//           input.total_price,
//           input.number_of_persons,
//           input.additional_notes || null,
//         ])
//       );
//       await Promise.all(roomInputsPromises);
//     }

//     // Commit transaction
//     await connection.commit();

//     res.status(200).json({ message: 'Booking updated successfully' });
//   } catch (err) {
//     await connection.rollback();
//     res.status(500).json({ message: 'An error occurred while updating the booking.', error: err.message });
//   } finally {
//     connection.release();
//   }
// };


// exports.getBookingByid = async(req,res)=> 
//   { 
//     const {id} = req.params;
//     console.log('checking id to get',id)
//     try{ 
//       // const query = 'SELECT * FROM bookings WHERE id = ?'; 
//       const query ='SELECT * FROM bookings WHERE id = 31';
//       const [result] = await db.execute(query);
//       console.log(result)
//   if (result.length > 0) {
//     res.status(200).json({
//       message: "Booking deleted successfully",
//       data: result[0],
//     });
//   } else {
//     res.status(404).json({
//       message: "No booking found with the given ID",
//     });
//   }
//     }
//     catch (err)
//     { 
//       res.status(500).json({message:"An error occured while fetching booking",error:err.message})
  
//     }
//   }


//   exports.addBookings = async(req,res)=> 
//   { 
//     const { rooms, checkin_date, checkout_date, user_id } = req.body;

//     const query = `INSERT INTO bookings (room_id, checkin_date, checkout_date, user_id, number_of_people, total_price) VALUES ?`;

//     const values = rooms.map(room => [
//         room.roomId, checkin_date, checkout_date, user_id, room.numberOfPeople, room.totalPrice
//     ]);

//     db.query(query, [values], (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Error booking rooms');
//         }
//         res.json({ success: true, affectedRows: results.affectedRows });
//     });
//   }