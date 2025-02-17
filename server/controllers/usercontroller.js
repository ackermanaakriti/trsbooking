
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
exports.registerUser=async(req,res)=> 
{ 
    const { name, email, password, role,selectedBranch } = req.body;
     console.log('name,email,passwork,role',name,email,password,role)
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('hashppawworid checking',hashedPassword)
  
      // Insert user into database
     const [result] = await db.execute('INSERT INTO users (name, email, password, role,branch_id) VALUES (?, ?, ?, ?,?)', 
        [name, email, hashedPassword, role,selectedBranch]);
        res.status(201).json({
            success: true,
            message: 'User added successfully',
            bookingId: result.insertId, // Return inserted booking ID
          });
      
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
}



exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    console.log('Checking login credentials for email:', email);
  
    try {
      // Query the database to find the user with the provided email
      const [result] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  
      // If no user is found, return an error
      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = result[0];
  
      // Compare the entered password with the hashed password in the database
      const match = await bcrypt.compare(password, user.password);
  
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate a JWT token for the user
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Respond with the success message and token
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };




 
  
  // Get all rooms
  exports.getAllUsers = async (req, res) => {
    const branchId = req.branchId;
    try {
      console.log('Fetching all inquiry');
      const [inquiry] = await db.execute('SELECT * FROM users WHERE  branch_id=?',[branchId]);
      res.json(inquiry);
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
  
  // Get a room by ID
  exports.getUsersByid = async (req, res) => {
    const branchId = req.branchId;

    const { id } = req.params;
    try {
      console.log(`Fetching room with ID: ${id}`);
      const [user] = await db.execute('SELECT * FROM users WHERE id = ? AND branch_id=?', [id,branchId]);
      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
  
  // Add a new room

  
  // Update a room
  exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    const branchId = req.branchId;

  
    try {
      // Hash the password if it's provided
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      console.log('hashedPassword checking', hashedPassword);
  
      console.log(`Updating user with ID: ${id}`);
  
      // If password is not provided, use the current password
      const query = password
        ? 'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ? AND branch_id=?'
        : 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ? AND branch_id =?';
  
      const values = password
        ? [name, email, hashedPassword, role, id,branchId]
        : [name, email, role, id,branchId];
  
      const [result] = await db.execute(query, values);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
  
  // Delete a room
  exports.deleteUser = async (req, res) => {
    const branchId = req.branchId;

    const { id } = req.params;
    try {
      const [result] = await db.execute('DELETE FROM users WHERE id = ? AND branch_id =?', [id,branchId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
  