const sequelize = require('./db');

// Importar todos los modelos
const User = require('../models/users');
const Device = require('../models/devices');
const Sensor = require('../models/sensors');
const SensorReading = require('../models/sensorReadings');
const Alert = require('../models/alerts');

// Función para sincronizar todas las tablas
const syncDatabase = async () => {
  try {
    // Sincronizar todas las tablas en orden
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
  }
};

module.exports = syncDatabase;