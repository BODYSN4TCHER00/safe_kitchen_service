const express = require('express');
const router = express.Router();
const Sensor = require('../models/sensors');
const Device = require('../models/devices');
const { protect } = require('../middleware/auth');

// Crear un nuevo sensor
router.post('/', protect, async (req, res) => {
  const { device_id, type, name, unit, threshold } = req.body;

  try {
    // Verificar todos los devices del usuario
    const userDevices = await Device.findAll({
      where: { user_id: req.user.id }
    });
    
    // Verificar si el device específico existe
    const device = await Device.findByPk(device_id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device no existe' });
    }

    // Luego verificar si pertenece al usuario
    if (device.user_id !== req.user.id) {
      return res.status(403).json({ 
        message: 'Device no pertenece al usuario',
        device_owner: device.user_id,
        current_user: req.user.id
      });
    }

    const sensor = await Sensor.create({
      device_id,
      type,
      name,
      unit,
      threshold
    });

    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ message: 'Error creando sensor', error: error.message });
  }
});

// Obtener todos los sensores del usuario
router.get('/', protect, async (req, res) => {
  try {
    console.log('🔒 Usuario autenticado:', req.user.id);
    
    // PASO 1: Obtener SOLO los devices del usuario autenticado
    const userDevices = await Device.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'name', 'user_id', 'api_key', 'created_at']
    });
    
    console.log('📱 Devices del usuario:', userDevices.length);
    
    // Si no tiene devices, retorna array vacío
    if (userDevices.length === 0) {
      console.log('⚠️ Usuario sin devices');
      return res.json([]);
    }
    
    // PASO 2: Extraer IDs de devices
    const deviceIds = userDevices.map(device => device.id);
    console.log('🎯 Device IDs permitidos:', deviceIds);
    
    // PASO 3: Obtener SOLO sensores de esos devices específicos
    const sensors = await Sensor.findAll({
      where: { 
        device_id: deviceIds 
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log('📡 Sensores encontrados:', sensors.length);
    
    // PASO 4: Manualmente agregar la info del device a cada sensor
    const sensorsWithDeviceInfo = sensors.map(sensor => {
      const deviceInfo = userDevices.find(device => device.id === sensor.device_id);
      
      return {
        id: sensor.id,
        device_id: sensor.device_id,
        type: sensor.type,
        name: sensor.name,
        unit: sensor.unit,
        threshold: sensor.threshold,
        created_at: sensor.created_at,
        device: deviceInfo ? {
          id: deviceInfo.id,
          name: deviceInfo.name,
          user_id: deviceInfo.user_id,
          api_key: deviceInfo.api_key,
          created_at: deviceInfo.created_at
        } : null
      };
    });
    
    // PASO 5: Verificación extra de seguridad
    const finalSensors = sensorsWithDeviceInfo.filter(sensor => 
      sensor.device && sensor.device.user_id === req.user.id
    );
    
    console.log('✅ Sensores finales después de filtrado:', finalSensors.length);
    
    res.json(finalSensors);
    
  } catch (error) {
    console.error('❌ Error obteniendo sensores:', error);
    res.status(500).json({ 
      message: 'Error obteniendo sensores', 
      error: error.message 
    });
  }
});

// Obtener sensores por device
router.get('/device/:deviceId', protect, async (req, res) => {
  try {
    // Verificar que el device pertenezca al usuario
    const device = await Device.findOne({
      where: { 
        id: req.params.deviceId,
        user_id: req.user.id 
      }
    });

    if (!device) {
      return res.status(404).json({ message: 'Device no encontrado' });
    }

    const sensors = await Sensor.findAll({
      where: { device_id: req.params.deviceId },
      order: [['created_at', 'DESC']]
    });

    res.json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo sensores', error: error.message });
  }
});

// Obtener un sensor específico
router.get('/:id', protect, async (req, res) => {
  try {
    const sensor = await Sensor.findOne({
      where: { id: req.params.id },
      include: [{
        model: Device,
        as: 'device',
        where: { user_id: req.user.id }
      }]
    });

    if (!sensor) {
      return res.status(404).json({ message: 'Sensor no encontrado' });
    }

    res.json(sensor);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo sensor', error: error.message });
  }
});

// Actualizar un sensor
router.put('/:id', protect, async (req, res) => {
  const { type, name, unit, threshold } = req.body;

  try {
    const [updatedRowsCount] = await Sensor.update(
      { type, name, unit, threshold },
      {
        where: { id: req.params.id },
        include: [{
          model: Device,
          as: 'device',
          where: { user_id: req.user.id }
        }]
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Sensor no encontrado' });
    }

    const updatedSensor = await Sensor.findByPk(req.params.id);
    res.json(updatedSensor);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando sensor', error: error.message });
  }
});

// Eliminar un sensor
router.delete('/:id', protect, async (req, res) => {
  try {
    const sensor = await Sensor.findOne({
      where: { id: req.params.id },
      include: [{
        model: Device,
        as: 'device',
        where: { user_id: req.user.id }
      }]
    });

    if (!sensor) {
      return res.status(404).json({ message: 'Sensor no encontrado' });
    }

    await sensor.destroy();
    res.json({ message: 'Sensor eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando sensor', error: error.message });
  }
});

module.exports = router;