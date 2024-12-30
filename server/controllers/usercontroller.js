
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
exports.registerUser=async(req,res)=> 
{ 
    const { name, email, password, role } = req.body;
     console.log('name,email,passwork,role',name,email,password,role)
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('hashppawworid checking',hashedPassword)
  
      // Insert user into database
     const [result] = await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
        [name, email, hashedPassword, role]);
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