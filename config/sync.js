const sequelize = require('./db');

// Importar todos los modelos
const User = require('../models/Users');
const Device = require('../models/device');

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