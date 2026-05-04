const express = require('express');
const cors = require('cors');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const authRoutes = require('./routes/auth');
const slotRoutes = require('./routes/slots');
const bookingRoutes = require('./routes/bookings');
const supervisorRoutes = require('./routes/supervisors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/supervisors', supervisorRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'BRACU Thesis Booking API is running!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));