const db = require('../config/db');

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    console.log('Fetching all rooms');
    const [rooms] = await db.execute('SELECT * FROM rooms');
    res.json(rooms);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a room by ID
exports.getRoomById = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching room with ID: ${id}`);
    const [rooms] = await db.execute('SELECT * FROM rooms WHERE id = ?', [id]);
    if (rooms.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(rooms[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Add a new room
exports.addRoom = async (req, res) => {
  const { room_number, room_name } = req.body;
  try {
    console.log('Adding new room:', room_name);
    const [result] = await db.execute(
      'INSERT INTO rooms (room_number, room_name) VALUES (?, ?)',
      [room_number, room_name]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update a room
exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_number, room_name } = req.body;
  try {
    console.log(`Updating room with ID: ${id}`);
    const [result] = await db.execute(
      'UPDATE rooms SET room_number = ?, room_name = ? WHERE id = ?',
      [room_number, room_name, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Deleting room with ID: ${id}`);
    const [result] = await db.execute('DELETE FROM rooms WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
