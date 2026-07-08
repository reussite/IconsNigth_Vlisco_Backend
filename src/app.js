const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes'); // ← nouveau
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes); 

app.use(errorMiddleware);

module.exports = app;