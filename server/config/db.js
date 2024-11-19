const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Using the pool.promise() to access the promise API
pool.promise().getConnection()
  .then((connection) => {
    console.log('Database connected successfully!');
    connection.release();  // Always release the connection back to the pool
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err.message);
  });

module.exports = pool.promise();
