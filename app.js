require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const userRoutes = require('./routes/users.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Test DB connection
db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));