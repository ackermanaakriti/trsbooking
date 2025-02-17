const db = require('../config/db');


exports.allbranches = async (req, res) => {
    try {
      const [branches] = await db.query('SELECT * FROM branches'); // Destructure rows
      console.log('Branches fetched:', branches); // Log the actual branch data
      res.json(branches); // Send only the rows as a response
    } catch (error) {
      console.error('Error fetching branches:', error); // Log the error for debugging
      res.status(500).json({ error: 'Error fetching branches' }); // Return an error response
    }
  };
  

  exports.addbranches = async (req, res) => {
    const { name, location, contact_email, contact_phone } = req.body;
    try {
      await db.query(
        'INSERT INTO branches (name, location, contact_email, contact_phone) VALUES (?, ?, ?, ?)',
        [name, location, contact_email, contact_phone]
      );
      res.json({ message: 'Branch added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error adding branch' });
    }
  };
  


  // Update a branch
exports.editbracnh = async (req, res) => {
    const { id } = req.params;
    const { name, location, contact_email, contact_phone } = req.body;
    try {
      await db.query(
        'UPDATE branches SET name = ?, location = ?, contact_email = ?, contact_phone = ? WHERE id = ?',
        [name, location, contact_email, contact_phone, id]
      );
      res.json({ message: 'Branch updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating branch' });
    }
  };



 exports.deletebranch = async (req, res) => {
    const { id } = req.params;
    try {
      await db.query('DELETE FROM branches WHERE id = ?', [id]);
      res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting branch' });
    }
  };
  