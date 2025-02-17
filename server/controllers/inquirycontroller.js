const db = require('../config/db');

// Get all rooms
// Get all inquiries for a specific branch
exports.getInquiry = async (req, res) => {
  const { branchId } = req;
  try {
    console.log(`Fetching all inquiries for branch ${branchId}`);
    const [inquiry] = await db.execute('SELECT * FROM inquiry WHERE branch_id = ?', [branchId]);
    res.json(inquiry);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a room by ID
// Get a specific inquiry by ID for a branch
exports.getInquiryById = async (req, res) => {
  const { id } = req.params;
  const { branchId } = req;
  try {
    console.log(`Fetching inquiry with ID: ${id} for branch ${branchId}`);
    const [inquiry] = await db.execute('SELECT * FROM inquiry WHERE id = ? AND branch_id = ?', [id, branchId]);
    if (inquiry.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found for this branch' });
    }
    res.json(inquiry[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};


// Add a new room
// Add a new inquiry for a specific branch
exports.addInquiry = async (req, res) => {
  const { customer_name, customer_phoneno, remarks, no_of_pax } = req.body;
  const { branchId } = req;
  try {
    const [result] = await db.execute(
      'INSERT INTO inquiry (customer_name, customer_phoneno, remarks, no_of_pax, branch_id) VALUES (?, ?, ?, ?, ?)',
      [customer_name, customer_phoneno, remarks, no_of_pax, branchId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).send(err.message);
  }
};


// Update an inquiry for a specific branch
exports.updateInquiry = async (req, res) => {
  const { id } = req.params;
  const { customer_name, customer_phoneno, remarks, no_of_pax } = req.body;
  const { branchId } = req;
  try {
    console.log(`Updating inquiry with ID: ${id} for branch ${branchId}`);
    const [result] = await db.execute(
      'UPDATE inquiry SET customer_name = ?, customer_phoneno = ?, remarks = ?, no_of_pax = ? WHERE id = ? AND branch_id = ?',
      [customer_name, customer_phoneno, remarks, no_of_pax, id, branchId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found for this branch' });
    }
    res.json({ message: 'Inquiry updated successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};


// Delete an inquiry for a specific branch
exports.deleteInquiry = async (req, res) => {
  const { id } = req.params;
  const { branchId } = req;
  try {
    console.log(`Deleting inquiry with ID: ${id} for branch ${branchId}`);
    const [result] = await db.execute('DELETE FROM inquiry WHERE id = ? AND branch_id = ?', [id, branchId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found for this branch' });
    }
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
