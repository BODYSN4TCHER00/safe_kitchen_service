const express = require('express');

const router = express.Router();

// Importar la ruta de cada modulo
const userRoutes = require('./users.routes');
const deviceRoutes = require('./devices.routes');
const sensorsRoutes = require('./sensors.routes');
const authRoutes = require('./auth.routes');
const sensorsReadingRoutes = require('./sensorReadings.routes');

// Usar rutas importadas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/sensors', sensorsRoutes);
router.use('/sensors-readings', sensorsReadingRoutes);

module.exports = router;