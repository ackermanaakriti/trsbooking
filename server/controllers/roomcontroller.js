const db = require('../config/db');

exports.getRooms = async (req, res) => {
  const [rooms] = await db.execute('SELECT * FROM rooms');
  res.json(rooms);
};

exports.addRoom = async (req, res) => {
  const { room_number, room_name } = req.body;
  console.log('checking room',room_name)
  
  try {
    const [result] = await db.execute(
      'INSERT INTO rooms (room_number, room_name) VALUES (?, ?)',
      [room_number, room_name]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Other CRUD functions...
