const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authroutes');
// const roomRoutes = require('./routes/roomroute');
// const bookingRoutes = require('./routes/bookingroutes');

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('App is listening!');
});

app.use('/api/auth', authRoutes); // This should work fine
// app.use('/api/rooms', roomRoutes); // Uncomment this when ready to test
// app.use('/api/bookings', bookingRoutes); // Uncomment when ready

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
