const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const propertyRoutes = require('./routes/propertyRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // if using media upload

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes); // Optional: For Azure uploads

// Health check
app.get('/', (req, res) => {
  res.send('PropNest API is running 🚀');
});

module.exports = app;
