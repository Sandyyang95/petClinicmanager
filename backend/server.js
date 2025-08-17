// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();


// CORS 

const allowedOrigins = ['http://localhost:3000', 'http://3.25.121.133', 'http://3.25.121.133:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
}));


// JSON parser
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));


// Connect DB and start server
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
