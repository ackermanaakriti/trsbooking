const db = require('../config/db');

// Get all rooms
exports.getInquiry = async (req, res) => {
  try {
    console.log('Fetching all inquiry');
    const [inquiry] = await db.execute('SELECT * FROM inquiry');
    res.json(inquiry);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a room by ID
exports.getInquiryById = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching room with ID: ${id}`);
    const [inquiry] = await db.execute('SELECT * FROM inquiry WHERE id = ?', [id]);
    if (inquiry.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(inquiry[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Add a new room
exports.addInquiry = async (req, res) => {
  const { customer_name, customer_phoneno , remarks } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO inquiry (customer_name, customer_phoneno,remarks) VALUES (?, ?, ?)',
      [customer_name, customer_phoneno,remarks]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update a room
exports.updateInquiry = async (req, res) => {
  const { id } = req.params;
  const { customer_name, customer_phoneno,remarks } = req.body;
  try {
    console.log(`Updating room with ID: ${id}`);
    const [result] = await db.execute(
      'UPDATE inquiry SET customer_name = ?, customer_phoneno = ?, remarks=?, WHERE id = ?',
      [customer_name, customer_phoneno,remarks, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry updated successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Delete a room
exports.deleteInquiry = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Deleting room with ID: ${id}`);
    const [result] = await db.execute('DELETE FROM inquiry WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
