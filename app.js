require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const syncDatabase = require('./config/sync'); 
const userRoutes = require('./routes/users.routes');
const deviceRoutes = require('./routes/devices.routes');

const app = express();

// Sincronizar base de datos
syncDatabase();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));