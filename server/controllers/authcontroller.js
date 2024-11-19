const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { email, password, role } = req.body;
    console.log('checking emal',email,password,role)
    
    // Check if any of the fields are undefined and handle them
    if (!email || !password || !role) {
      return res.status(400).send("All fields are required.");
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      // If any field can be optional or may have a null value, set it explicitly to `null` if undefined
      const [result] = await db.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, role || null]  // If `role` is undefined, pass `null` to SQL
      );
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
  
  exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (!user.length) return res.status(400).send('User not found');
      
      const validPass = await bcrypt.compare(password, user[0].password);
      if (!validPass) return res.status(400).send('Invalid password');
      
      const token = jwt.sign({ id: user[0].id, role: user[0].role }, process.env.JWT_SECRET);
      res.json({ token });
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
  
